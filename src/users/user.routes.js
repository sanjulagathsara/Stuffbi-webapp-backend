import express from 'express';

const router = express.Router();

// GET route to fetch user data
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Example: Fetch user from the database using userId
        const user = await User.findById(userId); // Replace with your actual database query
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                userId: user.id,
                email: user.email,
                createdAt: user.created_at,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


export default router;