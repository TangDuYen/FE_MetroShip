export const shipmentStatusMap = {
  0: 'Chờ thanh toán',
  1: 'Từ chối',
  2: 'Chưa thanh toán',
  3: 'Đã hủy',
  4: 'Chờ hoàn tiền',
  5: 'Đã hoàn tiền',
  6: 'Không đến gửi hàng',
  7: 'Chờ gửi hàng',
  8: 'Đã lấy hàng',
  9: 'Đang vận chuyển',
  10: 'Chờ nhận hàng',
  11: 'Thu phí tồn kho',
  12: 'Xuống hàng tại trạm',
  13: 'Chờ chuyển tàu',
  14: 'Chuyển tàu tiếp theo',
  15: 'Đã quá hạn',
  16: 'Trả đơn',
  17: 'Đang trả đơn',
  18: 'Đã trả đơn',
  19: 'Đã giao hàng',
  20: 'Hoàn tất',
  21: 'Bị chậm trễ',
  22: 'Đang lưu kho',
};


export const shipmentStatusColorMap = {
  0: "orange", // Đợi thanh toán
  1: "red", // Từ chối
  2: "volcano", // Không thanh toán
  3: "magenta", // Đã hủy
  4: "gold", // Đợi hoàn tiền
  5: "green", // Đã hoàn tiền
  6: "purple", // Không xuất hiện
  7: "blue", // Đợi gửi hàng
  8: "cyan", // Đã lấy hàng
  9: "processing", // Đang vận chuyển
  10: "lime", // Đợi lấy hàng
  11: "geekblue", // Thu phí tồn kho
  12: "red", // Quá hạn
  13: "volcano", // Hoàn đơn
  14: "orange", // Đang hoàn đơn
  15: "green", // Đã hoàn đơn
  16: "purple", // Đợi phản hồi
  17: "returning", // Đã hoàn thành
  20: "success", // Đã nhận hàng
  18: "warning", // Delayed
};

export const paymentStatusMap = {
  1: 'Đợi thanh toán',
  2: 'Đã thanh toán',
  3: 'Đã hủy',
  4: 'Thất bại'
};

export const paymentTransactionTypeMap = {
  1: 'Phí giao hàng',
  2: 'Phí phạt',
  3: 'Hoàn tiền'
}

// export const parcelStatusMap = {
//     0: "Đang xử lý",
//     1: "Đợi thanh toán",
//     2: "Đợi gửi hàng",
//     3: "Từ chối",
//     4: "Chưa thanh toán",
//     5: "Đã hủy",
//     6: "Chờ hoàn tiền",
//     7: "Đã hoàn tiền",
//     8: "Không đến gửi hàng",
//     9: "Đã nhận hàng tại trạm",
//     10: "Đang trên đường vận chuyển - Tuyến ",
//     11: "Chuyển sang tuyến ",
//     12: "Đã nhận hàng ở trạm",
//     13: "Đợi khách đến lấy hàng",
//     14: "Hết hạn",
//     15: "Lưu kho lâu",
//     16: "Hoàn thành"
// }

export const shipmentStatusSteps = [
  { id: 0, label: 'Đơn hàng đã được đặt' },
  { id: 8, label: 'Đơn vị vận chuyển đã lấy hàng' },
  { id: 9, label: 'Đơn hàng đang được vận chuyển' },
  { id: 10, label: 'Đơn hàng đang chờ lấy' },
  { id: 17, label: 'Đơn hàng đã giao thành công' },
];


