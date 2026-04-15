const jwt = require('jsonwebtoken');
require('dotenv').config(); 

module.exports = (req, res, next) => {
    // ĐƯA DÒNG NÀY VÀO TRONG ĐỂ ĐẢM BẢO NÓ LUÔN ĐỌC GIÁ TRỊ MỚI NHẤT
    const JWT_SECRET = process.env.JWT_SECRET; 
    
    console.log("Secret Key đang dùng là:", JWT_SECRET);
    
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Không có token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        // Log lỗi cụ thể ra để biết tại sao verify hụt
        console.error("Lỗi Verify Token:", err.message);
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
};