import Event from "../models/event.model";

/**
 * Tự động reject tất cả events đã quá ngày nhưng vẫn còn pending.
 * Áp dụng cho toàn bộ hệ thống, không phụ thuộc vào user gọi API.
 */
export const autoRejectExpiredPendingEvents = async () => {
  const now = new Date();

  const result = await Event.updateMany(
    {
      status: "pending",
      date: { $lt: now },
    },
    {
      $set: { status: "rejected" },
    }
  );

  if ((result as any).modifiedCount) {
    console.log(
      `🔁 Auto-reject: updated ${
        (result as any).modifiedCount
      } pending event(s) that passed their date.`
    );
  }
};

/**
 * Khởi động scheduler:
 * - Chạy 1 lần khi server start
 * - Sau đó chạy lại định kỳ (mặc định: mỗi 10 phút)
 */
export const startAutoRejectScheduler = (intervalMs: number = 10 * 60 * 1000) => {
  // Chạy ngay khi server khởi động
  autoRejectExpiredPendingEvents().catch((err) => {
    console.error("❌ Error when running initial autoRejectExpiredPendingEvents:", err);
  });

  // Đặt interval chạy định kỳ
  setInterval(() => {
    autoRejectExpiredPendingEvents().catch((err) => {
      console.error("❌ Error in scheduled autoRejectExpiredPendingEvents:", err);
    });
  }, intervalMs);
};


