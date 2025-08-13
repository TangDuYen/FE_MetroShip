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
  9: 'Đang lên hàng vào tàu',
  10: 'Đang vận chuyển',
  11: 'Đợi nhận hàng',
  12: 'Thu phí tồn kho',
  13: 'Xuống hàng khỏi tàu',
  14: 'Đang lưu kho',
  15: 'Đợi chuyển tàu',
  16: 'Đang chuyển tàu',
  17: 'Quá hạn',
  18: 'Trả đơn',
  19: 'Đang trả đơn',
  20: 'Đã trả đơn',
  21: 'Đã giao',
  22: 'Đã hoàn thành',
  23: 'Delayed',
  24: 'Đã đến',
  25: 'Bồi thường',
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
  16: "purple",      // Đang chuyển tàu
  17: "volcano",     // Quá hạn
  18: "blue",        // Trả đơn
  19: "success",     // Đang trả đơn
  20: "green",       // Đã trả đơn
  21: "warning",     // Đã giao
  22: "magenta",     // Đã hoàn thành
  23: "orange",      // Delayed - Chậm trễ 
  24: "cyan",        // Đã đến 
  25: "red",         // Bồi thường 
  26: "green",       // Đã bồi thường 
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

