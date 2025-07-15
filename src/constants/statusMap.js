export const shipmentStatusMap = {
    0: 'Đợi thanh toán',
    1: 'Từ chối',
    2: 'Không thanh toán',
    3: 'Đã hủy',
    4: 'Đợi hoàn tiền',
    5: 'Đã hoàn tiền',
    6: 'Không xuất hiện',
    7: 'Đợi gửi hàng',
    8: 'Đã lấy hàng',
    9: 'Đang vận chuyển',
    10: 'Đợi lấy hàng',
    11: 'Thu phí tồn kho',
    12: 'Quá hạn',
    13: 'Hoàn đơn',
    14: 'Đang hoàn đơn',
    15: 'Đã hoàn đơn',
    16: 'Đợi phản hồi',
    17: 'Đã hoàn thành',
    18: 'Delayed'
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


