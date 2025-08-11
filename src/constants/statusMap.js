export const shipmentStatusMap = {
  0: 'Chờ thanh toán',
  1: 'Từ chối',
  2: 'Không thanh toán',
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
  0: "orange",       // Chờ thanh toán
  1: "red",          // Từ chối
  2: "volcano",      // Không thanh toán
  3: "magenta",      // Đã hủy
  4: "gold",         // Chờ hoàn tiền
  5: "green",        // Đã hoàn tiền
  6: "purple",       // Không đến gửi hàng
  7: "blue",         // Chờ gửi hàng
  8: "cyan",         // Đã lấy hàng
  9: "processing",   // Đang vận chuyển
  10: "lime",        // Chờ nhận hàng
  11: "geekblue",    // Thu phí tồn kho
  12: "red",         // Xuống hàng tại trạm
  13: "volcano",     // Chờ chuyển tàu
  14: "orange",      // Chuyển tàu tiếp theo
  15: "red",         // Đã quá hạn
  16: "purple",      // Trả đơn
  17: "volcano",     // Đang trả đơn
  18: "blue",        // Đã trả đơn
  19: "success",     // Đã giao hàng
  20: "green",       // Hoàn tất
  21: "warning",     // Bị chậm trễ
  22: "magenta",     // Đang lưu kho
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

export const parcelStatusMap = {
    2: "Bình thường",
    4: "Bị mất",
}

export const parcelStatusColorMap = {
    2: "green",
    4: "red",
}

export const shipmentStatusSteps = [
  { id: 0, label: 'Đơn hàng đã được đặt' },
  { id: 8, label: 'Đơn vị vận chuyển đã lấy hàng' },
  { id: 9, label: 'Đơn hàng đang được vận chuyển' },
  { id: 10, label: 'Đơn hàng đang chờ lấy' },
  { id: 17, label: 'Đơn hàng đã giao thành công' },
];


