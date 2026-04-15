const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; 

class UserController {
    static async get(req, res) {
        try {
            const users = await User.findAll({
                attributes: { exclude: ['password'] }
            });

            return res.status(200).json({
                status: 200,
                message: 'Lấy danh sách thành công',
                data: users
            });
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id, {
                attributes: { exclude: ['password'] }
            });

            if (!user) {
                return res.status(404).json({ message: 'Id không tồn tại' });
            }

            return res.status(200).json({
                status: 200,
                data: user
            });
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }

    static async updateActive(req, res) {
        try {
            const { id } = req.params;
            const { active } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: 'Id không tồn tại' });
            }

            if (active === undefined || active === null) {
                return res.status(400).json({ message: 'Active không được để trống' });
            }

            if (![0, 1, '0', '1'].includes(active)) {
                return res.status(400).json({ message: 'Active chỉ nhận 0 hoặc 1' });
            }

            user.active = String(active);
            await user.save();

            const updatedUser = await User.findByPk(id, {
                attributes: { exclude: ['password'] }
            });

            return res.status(200).json({
                message: 'Cập nhật active thành công',
                user: updatedUser
            });
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }

    static async register(req, res) {
        try {
            const { full_name, email, password } = req.body;
            console.log(req.body);

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email đã tồn tại!' });
            }

            const user = await User.create({ full_name, email, password });

            res.status(201).json({
                message: "Đăng ký thành công!",
                user: { id: user.id, full_name: user.full_name, email: user.email }
            });

        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ message: "Email hoặc mật khẩu không chính xác!" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Email hoặc mật khẩu không chính xác!" });
            }

            const token = jwt.sign({ id: user.id, full_name: user.full_name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
            return res.status(200).json({
                message: "Đăng nhập thành công!",
                token
            });

        } catch (error) {
            console.error("Lỗi server:", error);
            return res.status(500).json({ message: "Lỗi server, vui lòng thử lại!", error: error.message });
        }
    }
    static async profile(req, res) {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            status: 200,
            data: user
        });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
}
static async changePassword(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findByPk(req.user.id);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ sai' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công' });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
}
}

module.exports = UserController;
