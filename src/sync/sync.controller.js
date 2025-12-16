const pool = require("../config/db");
const { logActivity } = require("../activity/activity.service");

/**
 * POST /sync
 * Bidirectional sync: push local changes, pull server changes
 * 
 * Request body:
 * {
 *   items: { created: [], updated: [], deleted: [] },
 *   bundles: { created: [], updated: [], deleted: [] },
 *   activity_logs: [], // optional, if sync enabled
 *   last_sync_at: "2025-01-01T00:00:00.000Z" // for pulling changes
 * }
 */
exports.sync = async (req, res) => {
    const userId = req.user.id;
    const { items, bundles, activity_logs, last_sync_at } = req.body;

    try {
        const result = {
            items: { created: [], updated: [], deleted: [] },
            bundles: { created: [], updated: [], deleted: [] },
            activity_logs: [],
            server_time: new Date().toISOString()
        };

        // --- PUSH: Process incoming changes ---

        // Process bundle changes first (items depend on bundles)
        if (bundles) {
            // Handle created bundles
            for (const bundle of bundles.created || []) {
                const created = await createBundleWithClientId(userId, bundle);
                result.bundles.created.push(created);
            }

            // Handle updated bundles
            for (const bundle of bundles.updated || []) {
                const updated = await updateBundleByClientId(userId, bundle);
                if (updated) result.bundles.updated.push(updated);
            }

            // Handle deleted bundles
            for (const clientId of bundles.deleted || []) {
                await deleteBundleByClientId(userId, clientId);
                result.bundles.deleted.push(clientId);
            }
        }

        // Process item changes
        if (items) {
            // Handle created items
            for (const item of items.created || []) {
                // Map bundle client_id to server bundle_id if needed
                if (item.bundle_client_id) {
                    const bundleRow = await pool.query(
                        "SELECT id FROM bundles WHERE client_id = $1 AND user_id = $2",
                        [item.bundle_client_id, userId]
                    );
                    if (bundleRow.rows.length > 0) {
                        item.bundle_id = bundleRow.rows[0].id;
                    }
                }
                const created = await createItemWithClientId(userId, item);
                result.items.created.push(created);
            }

            // Handle updated items
            for (const item of items.updated || []) {
                // Map bundle client_id to server bundle_id if needed
                if (item.bundle_client_id) {
                    const bundleRow = await pool.query(
                        "SELECT id FROM bundles WHERE client_id = $1 AND user_id = $2",
                        [item.bundle_client_id, userId]
                    );
                    if (bundleRow.rows.length > 0) {
                        item.bundle_id = bundleRow.rows[0].id;
                    }
                }
                const updated = await updateItemByClientId(userId, item);
                if (updated) result.items.updated.push(updated);
            }

            // Handle deleted items
            for (const clientId of items.deleted || []) {
                await deleteItemByClientId(userId, clientId);
                result.items.deleted.push(clientId);
            }
        }

        // Process activity logs (if sync enabled)
        if (activity_logs && activity_logs.length > 0) {
            for (const log of activity_logs) {
                await createActivityLogWithClientId(userId, log);
            }
        }

        // --- PULL: Get server changes since last_sync_at ---
        if (last_sync_at) {
            const pullResult = await pullChangesSince(userId, last_sync_at);
            result.items.server_changes = pullResult.items;
            result.bundles.server_changes = pullResult.bundles;
            result.activity_logs = pullResult.activity_logs;
        }

        res.json(result);
    } catch (err) {
        console.error("SYNC ERROR:", err);
        res.status(500).json({ message: "Sync failed", error: err.message });
    }
};

/**
 * GET /sync/pull?since=2025-01-01T00:00:00.000Z
 * Pull all changes since a specific timestamp
 */
exports.pullChanges = async (req, res) => {
    const userId = req.user.id;
    const since = req.query.since || new Date(0).toISOString();

    try {
        const result = await pullChangesSince(userId, since);
        result.server_time = new Date().toISOString();
        res.json(result);
    } catch (err) {
        console.error("PULL ERROR:", err);
        res.status(500).json({ message: "Pull failed", error: err.message });
    }
};

// --- Helper Functions ---

async function createItemWithClientId(userId, item) {
    const { client_id, name, subtitle, bundle_id, image_url } = item;

    // Check if already exists (idempotency)
    const existing = await pool.query(
        "SELECT * FROM items WHERE client_id = $1 AND user_id = $2",
        [client_id, userId]
    );
    if (existing.rows.length > 0) {
        return existing.rows[0];
    }

    const { rows } = await pool.query(
        `INSERT INTO items (user_id, client_id, name, subtitle, bundle_id, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
        [userId, client_id, name, subtitle || null, bundle_id || null, image_url || null]
    );

    await logActivity(userId, "item", rows[0].id, "create", null, rows[0]);
    return rows[0];
}

async function updateItemByClientId(userId, item) {
    const { client_id, name, subtitle, bundle_id, image_url, updated_at } = item;

    // Get existing item
    const existing = await pool.query(
        "SELECT * FROM items WHERE client_id = $1 AND user_id = $2",
        [client_id, userId]
    );

    if (existing.rows.length === 0) {
        // Item doesn't exist, create it
        return await createItemWithClientId(userId, item);
    }

    const oldItem = existing.rows[0];

    // Conflict resolution: last-write-wins based on updated_at
    if (updated_at && oldItem.updated_at) {
        const clientTime = new Date(updated_at);
        const serverTime = new Date(oldItem.updated_at);
        if (clientTime <= serverTime) {
            // Server has newer data, return server version
            return oldItem;
        }
    }

    const { rows } = await pool.query(
        `UPDATE items
     SET name = COALESCE($1, name),
         subtitle = COALESCE($2, subtitle),
         bundle_id = $3,
         image_url = COALESCE($4, image_url),
         updated_at = NOW()
     WHERE client_id = $5 AND user_id = $6
     RETURNING *`,
        [name, subtitle, bundle_id, image_url, client_id, userId]
    );

    await logActivity(userId, "item", rows[0].id, "update", oldItem, rows[0]);
    return rows[0];
}

async function deleteItemByClientId(userId, clientId) {
    const { rows } = await pool.query(
        "DELETE FROM items WHERE client_id = $1 AND user_id = $2 RETURNING *",
        [clientId, userId]
    );
    if (rows.length > 0) {
        await logActivity(userId, "item", rows[0].id, "delete", rows[0], null);
    }
    return rows[0];
}

async function createBundleWithClientId(userId, bundle) {
    const { client_id, title, subtitle, image_url } = bundle;

    // Check if already exists (idempotency)
    const existing = await pool.query(
        "SELECT * FROM bundles WHERE client_id = $1 AND user_id = $2",
        [client_id, userId]
    );
    if (existing.rows.length > 0) {
        return existing.rows[0];
    }

    const { rows } = await pool.query(
        `INSERT INTO bundles (user_id, client_id, title, subtitle, image_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
        [userId, client_id, title, subtitle || null, image_url || null]
    );

    await logActivity(userId, "bundle", rows[0].id, "create", null, rows[0]);
    return rows[0];
}

async function updateBundleByClientId(userId, bundle) {
    const { client_id, title, subtitle, image_url, updated_at } = bundle;

    const existing = await pool.query(
        "SELECT * FROM bundles WHERE client_id = $1 AND user_id = $2",
        [client_id, userId]
    );

    if (existing.rows.length === 0) {
        return await createBundleWithClientId(userId, bundle);
    }

    const oldBundle = existing.rows[0];

    // Conflict resolution: last-write-wins
    if (updated_at && oldBundle.updated_at) {
        const clientTime = new Date(updated_at);
        const serverTime = new Date(oldBundle.updated_at);
        if (clientTime <= serverTime) {
            return oldBundle;
        }
    }

    const { rows } = await pool.query(
        `UPDATE bundles
     SET title = COALESCE($1, title),
         subtitle = COALESCE($2, subtitle),
         image_url = COALESCE($3, image_url),
         updated_at = NOW()
     WHERE client_id = $4 AND user_id = $5
     RETURNING *`,
        [title, subtitle, image_url, client_id, userId]
    );

    await logActivity(userId, "bundle", rows[0].id, "update", oldBundle, rows[0]);
    return rows[0];
}

async function deleteBundleByClientId(userId, clientId) {
    const { rows } = await pool.query(
        "DELETE FROM bundles WHERE client_id = $1 AND user_id = $2 RETURNING *",
        [clientId, userId]
    );
    if (rows.length > 0) {
        await logActivity(userId, "bundle", rows[0].id, "delete", rows[0], null);
    }
    return rows[0];
}

async function createActivityLogWithClientId(userId, log) {
    const { client_id, entity_type, entity_id, action, old_value, new_value, created_at } = log;

    // Check if already exists
    const existing = await pool.query(
        "SELECT * FROM activity_log WHERE client_id = $1",
        [client_id]
    );
    if (existing.rows.length > 0) {
        return existing.rows[0];
    }

    const { rows } = await pool.query(
        `INSERT INTO activity_log (user_id, client_id, entity_type, entity_id, action, old_value, new_value, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, NOW()))
     RETURNING *`,
        [userId, client_id, entity_type, entity_id, action,
            old_value ? JSON.stringify(old_value) : null,
            new_value ? JSON.stringify(new_value) : null,
            created_at]
    );
    return rows[0];
}

async function pullChangesSince(userId, since) {
    const sinceDate = new Date(since);

    // Get updated items
    const itemsResult = await pool.query(
        `SELECT items.*, bundles.client_id as bundle_client_id 
     FROM items 
     LEFT JOIN bundles ON items.bundle_id = bundles.id
     WHERE items.user_id = $1 AND items.updated_at > $2
     ORDER BY items.updated_at ASC`,
        [userId, sinceDate]
    );

    // Get updated bundles
    const bundlesResult = await pool.query(
        `SELECT * FROM bundles 
     WHERE user_id = $1 AND updated_at > $2
     ORDER BY updated_at ASC`,
        [userId, sinceDate]
    );

    // Get activity logs
    const activityResult = await pool.query(
        `SELECT * FROM activity_log 
     WHERE user_id = $1 AND created_at > $2
     ORDER BY created_at ASC
     LIMIT 100`,
        [userId, sinceDate]
    );

    return {
        items: itemsResult.rows,
        bundles: bundlesResult.rows,
        activity_logs: activityResult.rows
    };
}
