// export const shipmentStatusMap = {
//   0: 'Chờ thanh toán',
//   1: 'Từ chối',
//   2: 'Không thanh toán',
//   3: 'Đã hủy',
//   4: 'Chờ hoàn tiền',
//   5: 'Đã hoàn tiền',
//   6: 'Không đến gửi hàng',
//   7: 'Chờ gửi hàng',
//   8: 'Đã lấy hàng',
//   9: 'Đang vận chuyển',
//   10: 'Đợi nhận hàng',
//   11: 'Thu phí tồn kho',
//   13: 'Xuống hàng khỏi tàu',
//   14: 'Đợi chuyển tàu',
//   // 15: 'Đợi chuyển tàu',
//   16: 'Quá hạn',
//   // 17: 'Quá hạn',
//   // 18: 'Trả đơn',
//   19: 'Hoàn đơn',
//   21: 'Đã hoàn thành',
//   22: 'Delayed',
//   23: 'Đã đến trạm đích',
//   24: 'Đơn đã hoàn thành. Đợi bồi thường',
//   25: 'Đợi bồi thường',
//   26: 'Đã bồi thường',
// };
export const shipmentStatusMap = {
  0: 'Chờ thanh toán',
  1: 'Từ chối',
  2: 'Chưa thanh toán',
  3: 'Đã hủy',
  4: 'Chờ hoàn tiền',
  5: 'Đã hoàn tiền',
  6: 'Không gửi hàng',
  7: 'Chờ gửi hàng',
  8: 'Đã lấy hàng',
  9: 'Đang vận chuyển',
  10: 'Chờ nhận hàng',
  11: 'Thu phụ phí',
  13: 'Xuống hàng',
  14: 'Chờ chuyển tàu',
  16: 'Quá hạn',
  19: 'Hoàn đơn',
  21: 'Hoàn thành',
  22: 'Trì hoãn',
  23: 'Đến trạm đích',
  24: 'Đã giao. Chờ bồi thường',
  25: 'Chờ bồi thường',
  26: 'Đã bồi thường',
};

export const shipmentStatusColorMap = {
  0: "orange",       // Chờ thanh toán
  1: "red",          // Từ chối
  2: "volcano",      // Không thanh toán
  3: "magenta",      // Đã hủy
  4: "gold",         // Chờ hoàn tiền
  5: "green",        // Đã hoàn tiền
  6: "purple",       // Không đến gửi hàng
  7: "blue",         // Chờ gửi hàng
  8: "cyan",         // Đã lấy hàng
  9: "processing",   // Đang lên hàng vào tàu 
  10: "lime",        // Đang vận chuyển 
  11: "geekblue",    // Đợi nhận hàng 
  12: "red",         // Thu phí tồn kho 
  13: "volcano",     // Xuống hàng khỏi tàu
  14: "orange",      // Đang lưu kho
  15: "red",         // Đợi chuyển tàu
  16: "volcano",      // Đang chuyển tàu
  17: "volcano",     // Quá hạn
  18: "blue",        // Trả đơn
  19: "purple",     // Đang trả đơn
  20: "green",       // Đã trả đơn
  21: "green",     // Đã giao
  22: "volcano",     // Đã hoàn thành
  23: "blue",      // Delayed - Chậm trễ 
  24: "pink",        // Đã đến 
  25: "red",         // Bồi thường 
  26: "green",       // Đã bồi thường 
};


export const trainStatusMap = {
  0: "Chưa được lập lịch",             // NotScheduled
  1: "Đã lập lịch",                    // Scheduled
  2: "Chờ khởi hành",                  // AwaitingDeparture
  3: "Đã khởi hành",                   // Departed
  4: "Đang di chuyển",                 // InTransit
  5: "Đã đến ga ",                     // ArrivedAtStation
  7: "Tiếp tục hành trình",            // ResumingTransit
  8: "Bị trì hoãn",                    // Delayed
  9: "Đã hủy",                         // Cancelled
  10: "Đã hoàn thành",                 // Completed
};

export const trainStatusColorMap = {
  0: "default",  // xám
  1: "blue",     // xanh dương
  2: "orange",   // cam
  3: "geekblue",    // xanh lá
  4: "cyan",     // xanh ngọc
  5: "purple",   // tím
  7: "magenta", // xanh đậm
  8: "volcano",  // đỏ cam (delay)
  9: "red",      // đỏ (cancelled)
  10: "success", // xanh lá (completed)
};

export const paymentStatusMap = {
  1: 'Đợi thanh toán',
  2: 'Đã thanh toán',
  3: 'Đã hủy',
  4: 'Thất bại',
};

export const paymentStatusColorMap = {
  1: "yellow",
  2: "green",
  3: "red",
  4: "red",
};

export const paymentTransactionTypeMap = {
  1: 'Phí giao hàng',
  2: 'Phí phạt',
  3: 'Hoàn tiền',
  4: 'Phí bồi thường'
}

export const paymentTransactionTypeColorMap = {
  1: "green",
  2: "red",
  3: "yellow",
  4: "pink"
}

export const supportTicketType = {
  1: 'Hỗ trợ vấn đề bồi thường',
  2: 'Hỗ trợ vấn đề kỹ thuật',
  3: 'Hỗ trợ vấn đề giao dịch',
  4: 'Hỗ trợ vấn đề giao hàng',
  5: 'Hỗ trợ vấn đề tài khoản',
  6: 'Hỗ trợ vấn đề đánh giá',
  7: 'Khác',
}

export const supportTicketStatus = {
  1: 'Đang giải quyết',
  2: 'Đã giải quyết',
  3: 'Từ chối',
}

export const supportTicketStatusColorMap = {
  1: "yellow",
  2: "green",
  3: "red",
}

export const parcelStatusMap = {
  1: "Đã đặt",
  2: "Bình thường",
  3: "Bị hư hại",
  4: "Bị mất",
  5: "Đã hủy",
}

export const parcelStatusColorMap = {
  1: "blue",
  2: "green",
  3: "purple",
  4: "red",
  5: "#ff6600ff",
}

export const shipmentStatusSteps = [
  { id: 0, label: 'Đơn hàng đã được đặt' },
  { id: 8, label: 'Đơn vị vận chuyển đã lấy hàng' },
  { id: 10, label: 'Đơn hàng đang được vận chuyển' },
  { id: 11, label: 'Đơn hàng đang chờ lấy' },
  { id: 21, label: 'Đơn hàng đã giao thành công' },
];

// export const formatCurrency = (v) => v.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' VND';
export const formatCurrency = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return `${Math.floor(n).toLocaleString('vi-VN')} VND`;
};

export const formatCurrency1 = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return `${Math.floor(n).toLocaleString('vi-VN')}`;
};

