const OrderModel = require("../models/order");
const UserModel = require("../models/user");
const OrderDetailModel = require("../models/orderDetail");

const VALID_STATUSES = [0, 1, 2, 3];
const STATUS_TO_ENUM_VALUE = {
  pending: "0",
  confirmed: "1",
  shipping: "2",
  completed: "3",
};

const normalizeStatusToEnumValue = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const numericStatus = Number(value);
  if (Number.isInteger(numericStatus) && VALID_STATUSES.includes(numericStatus)) {
    return String(numericStatus);
  }

  if (typeof value === "string") {
    const label = value.trim().toLowerCase();
    return STATUS_TO_ENUM_VALUE[label] || null;
  }

  return null;
};

class OrderController {
  static async get(req, res) {
    try {
      const orders = await OrderModel.findAll({
        include: [
          {
            model: UserModel,
            attributes: ["id", "full_name", "email"],
          },
          {
            model: OrderDetailModel,
            attributes: ["id", "product_id", "quantity", "price"],
          },
        ],
      });
      res.status(200).json({
        status: 200,
        message: "Lấy danh sách thành công",
        data: orders,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;

      const order = await OrderModel.findByPk(id, {
        include: [
          {
            model: UserModel,
            attributes: ["id", "full_name", "email"],
          },
          {
            model: OrderDetailModel,
            attributes: ["id", "product_id", "quantity", "price"],
          },
        ],
      });

      if (!order) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      res.status(200).json({
        status: 200,
        data: order,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { user_id, total_price, status } = req.body;

      const code = "ORD-" + Date.now();

      if (!total_price) {
        return res.status(400).json({
          status: 400,
          message: "Tổng giá tiền không được trống",
        });
      }

      if (total_price < 0) {
        return res.status(400).json({
          status: 400,
          message: "Tổng giá tiền phải lớn hơn 0",
        });
      }

      if (user_id) {
        const user = await UserModel.findByPk(user_id);
        if (!user) {
          return res.status(404).json({ message: "Id không tồn tại" });
        }
      }

      if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          status: 400,
          message: `Trạng thái không hợp lệ. Các trạng thái hợp lệ: ${VALID_STATUSES.join(", ")}`,
        });
      }

      if (typeof status !== "number" || !Number.isInteger(status)) {
        return res
          .status(400)
          .json({ message: "Trạng thái phải là số nguyên" });
      }

      const order = await OrderModel.create({
        user_id,
        code,
        total_price,
        status: status || 0,
      });

      res.status(201).json({
        message: "Thêm mới thành công",
        order,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await OrderModel.findByPk(id);
      if (!order) {
        return res.status(404).json({ message: "Đơn hàng không tồn tại" });
      }

      const normalizedStatus = normalizeStatusToEnumValue(status);
      if (!normalizedStatus) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }

      order.status = normalizedStatus;
      await order.save();
      await order.reload();

      return res.status(200).json({ message: "Cập nhật thành công", order });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const order = await OrderModel.findByPk(id);
      if (!order) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      await order.destroy();

      res.status(200).json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async myOrders(req, res) {
  try {

      console.log("TOKEN USER:", req.user);
    const orders = await OrderModel.findAll({
      where: { user_id: req.user.id }, // 👈 quan trọng
      include: [
        {
          model: OrderDetailModel,
        }
      ]
    });

    res.status(200).json({
      status: 200,
      data: orders
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
}

module.exports = OrderController;
