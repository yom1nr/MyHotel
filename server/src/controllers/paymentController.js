const omise = require('omise')({
    publicKey: process.env.OMISE_PUBLIC_KEY,
    secretKey: process.env.OMISE_SECRET_KEY,
});

exports.createPromptPayQR = async (req, res) => {
    try {
        const { amount, bookingId } = req.body;

        const charge = await omise.charges.create({
            amount: amount * 100,
            currency: 'thb',
            source: { type: 'promptpay' },
            metadata: { bookingId: bookingId }
        });

        res.status(200).json({
            success: true,
            chargeId: charge.id,
            qrCodeUrl: charge.source.scannable_code.image.download_uri
        });

    } catch (error) {
        console.error('Omise Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};