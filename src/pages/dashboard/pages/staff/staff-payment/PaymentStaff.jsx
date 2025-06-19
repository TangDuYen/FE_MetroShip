import './PaymentStaff.scss';

import { Col, DatePicker, Row, Select, Table } from 'antd';
import { useEffect, useState } from 'react';

import api from '../../../../../config/axios';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

function PaymentStaff() {
  const [allPayments, setAllPayments] = useState([]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN').format(value);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi cả 2 API song song
        const [paymentsRes, shipmentsRes] = await Promise.all([
          api.get('/Transaction?PageSize=100'),
          api.get('/shipments?PageSize=100'),
        ]);

        const payments = paymentsRes.data?.data?.items || [];
        const shipments = shipmentsRes.data?.data?.items || [];
        console.log(payments);

        // Tạo map shipmentId -> trackingCode
        const shipmentMap = {};
        shipments.forEach((s) => {
          shipmentMap[s.id] = s.trackingCode;
        });

        // Format data để đưa vào table
        const formatted = payments.map((item, index) => {
          const methodMap = {
            1: 'Tiền mặt',
            2: 'VNPay',
            3: 'MoMo',
          };

          return {
            key: item.paymentTrackingId || index,
            stt: index + 1,
            trackingCode: shipmentMap[item.shipmentId] || 'Không tìm thấy',
            shipmentId: item.shipmentId,
            paymentTrackingId: item.paymentTrackingId || 'N/A',
            paymentMethod: methodMap[item.paymentMethod] || 'Không rõ',
            paymentStatus: item.paymentStatus || 'Không rõ',
            paymentDate: item.paymentDate,
            paymentTime: item.paymentTime,
            paymentAmount: item.paymentAmount,
            paymentCurrency: item.paymentCurrency || 'VND',
            transactionType: item.transactionType,
          };
        });

        setAllPayments(formatted);
      } catch (error) {
        toast.error('Lỗi khi lấy dữ liệu thanh toán hoặc đơn hàng');
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 60,
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'trackingCode',
      key: 'trackingCode',
    },
    {
      title: 'Mã giao dịch',
      dataIndex: 'paymentTrackingId',
      key: 'paymentTrackingId',
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Thời điểm tạo giao dịch',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (value) =>
        value && value !== '0001-01-01T00:00:00+00:00'
          ? dayjs(value).format('YYYY-MM-DD HH:mm:ss')
          : 'Chưa xác định',
    },
    {
      title: 'Thời điểm thanh toán',
      dataIndex: 'paymentTime',
      key: 'paymentTime',
      render: (value) =>
        value && value !== '0001-01-01T00:00:00+00:00'
          ? dayjs(value).format('YYYY-MM-DD HH:mm:ss')
          : 'Chưa xác định',
    },
    {
      title: 'Tổng chi phí',
      dataIndex: 'paymentAmount',
      key: 'paymentAmount',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Đơn vị tiền tệ',
      dataIndex: 'paymentCurrency',
      key: 'paymentCurrency',
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'transactionType',
      key: 'transactionType',
      render: (status) => {
        const statusMapping = {
          1: 'Phí giao hàng',
          2: 'Phí phạt',
          3: 'Hoàn tiền',
        };
        return statusMapping[status] || 'N/A';
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (payment) => {
        const paymentMapping = {
          1: 'Đợi thanh toán',
          2: 'Đã thanh toán',
          3: 'Đã hủy',
          4: 'Thất bại'
        };
        return paymentMapping[payment] || 'N/A';
      },
    },
  ];

  return (
    <>
      <div className="payment-staff-container">
        {/* <div className="filter-sort" style={{ marginBottom: "1em" }}>
          <Row gutter={16}>
            <Col span={6}>
              <DatePicker
                value={dateFilter ? moment(dateFilter) : null}
                onChange={(date) => { setDateFilter(date); handleFilterChange(); }}
                placeholder="Chọn ngày"
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={6}>
              <Select
                value={stationFilter}
                onChange={(value) => { setStationFilter(value); handleFilterChange(); }}
                placeholder="Chọn trạm"
                style={{ width: '100%' }}
              >
                {stations.map(station => (
                  <Option key={station.id} value={station.id}>
                    {station.stationNameVi}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div> */}
        <Table
          columns={columns}
          dataSource={allPayments}
          rowKey="key"
          pagination={{ pageSize: 10 }}
          bordered
          style={{ cursor: 'pointer' }}
        />
      </div>
    </>
  );
}

export default PaymentStaff;
