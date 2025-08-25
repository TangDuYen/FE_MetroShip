import "./MetroLineManagement.scss";

import {
  Button,
  ConfigProvider,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { getAllStations, getMetroLines } from "../../../../../config/metroApi";
import { useEffect, useState } from "react";

import api from "../../../../../config/axios";
import { toast } from "react-toastify";

function MetroLineManagement() {
  const [metroLines, setMetroLines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [form] = Form.useForm();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLine, setSelectedLine] = useState(null);

  //API ONE TIME
  useEffect(() => {
    Promise.all([getAllStations(), getMetroLines()]).then(
      ([stationData, metroLineData]) => {
        setMetroLines(metroLineData);
        setStations(stationData);
      }
    );
  }, []);

  const filteredLines = selectedLine
    ? metroLines.filter((line) => line.lineNameVi === selectedLine)
    : metroLines;

  const openAddModal = () => {
    setEditingLine(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (line) => {
    setEditingLine(line);
    form.setFieldsValue(line);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    message.success("Đã xóa tuyến metro.");
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        const enrichedStations = (values.stations || []).map((s, index) => {
          const station = stations.find((st) => st.id === s.stationId);
          return {
            id: station?.id,
            stationNameVi: station?.stationNameVi,
            stationNameEn: station?.stationNameEn,
            address: s.address || "N/A",
            isUnderground: false,
            isActive: true,
            regionId: station?.regionId,
            latitude: 0,
            longitude: 0,
            toNextStationKm: 0,
          };
        });

        const payload = {
          lineNameVi: values.lineNameVi,
          lineNameEn: values.lineNameEn,
          regionCode: values.regionCode,
          lineNumber: Number(values.lineNumber),
          lineCode: values.lineCode,
          stations: enrichedStations,
        };

        try {
          setLoading(true);
          if (editingLine) {
            // await api.put(`/api/metro-lines/${editingLine.id}`, payload);
            toast.success("Cập nhật thành công!");
          } else {
            await api.post("/api/metro-lines", payload);
            toast.success("Đã thêm tuyến mới!");
          }

          const metroLineData = await getMetroLines();
          setMetroLines(metroLineData);

          setIsModalOpen(false);
          form.resetFields();
        } catch (error) {
          console.error("Submit failed:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Có lỗi khi gửi dữ liệu!";
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      })
      .catch((info) => {
        console.error("Validate Failed:", info);
      });
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Tên tuyến Vi",
      dataIndex: "lineNameVi",
    },
    {
      title: "Tên tuyến En",
      dataIndex: "lineNameEn",
    },
    {
      title: "Hành động",
      dataIndex: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Xác nhận xoá tàu này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="metro-line-management-container">
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openAddModal}>
          Thêm tuyến mới
        </Button>
        <Select
          allowClear
          placeholder="Chọn tuyến"
          style={{ width: 250, marginLeft: 8}}
          value={selectedLine}
          onChange={(value) => setSelectedLine(value)}
        >
          {[...new Set(metroLines.map((line) => line.lineNameVi))].map(
            (lineName) => (
              <Select.Option key={lineName} value={lineName}>
                {lineName}
              </Select.Option>
            )
          )}
        </Select>
        <Button
          className="clear-filter-button"
          style={{marginLeft: 8}}
          icon={<ReloadOutlined />}
          onClick={() => {
            setSelectedLine(null);
          }}
        ></Button>
      </div>

      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <ConfigProvider
          renderEmpty={() => (
            <Empty
              image={Empty.PRESENTED_IMAGE_DEFAULT}
              description="Không có dữ liệu"
            />
          )}
        >
          <Table
            columns={columns}
            dataSource={filteredLines}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </ConfigProvider>
      </Spin>

      <Modal
        title={editingLine ? "Cập nhật tuyến Metro" : "Thêm tuyến Metro mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        cancelText="Hủy"
        width={900}
        okText={editingLine ? "Lưu" : "Thêm"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên tuyến (Tiếng Việt)"
            name="lineNameVi"
            rules={[{ required: true, message: "Nhập tên tuyến tiếng Việt" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Tên tuyến (Tiếng Anh)"
            name="lineNameEn"
            rules={[{ required: true, message: "Nhập tên tuyến tiếng Anh" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Region Code"
            name="regionCode"
            rules={[{ required: true, message: "Nhập mã vùng (regionCode)" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Line Code"
            name="lineCode"
            rules={[{ required: true, message: "Nhập mã tuyến (lineCode)" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Line Number"
            name="lineNumber"
            rules={[{ required: true, message: "Nhập số tuyến (lineNumber)" }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.List name="stations">
            {(fields, { add, remove }) => (
              <>
                <div style={{ marginBottom: 12, fontWeight: 600 }}>
                  Danh sách ga (stations)
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "stationId"]}
                      rules={[{ required: true, message: "Chọn ga" }]}
                      style={{ flex: 2 }}
                    >
                      <Select
                        showSearch
                        placeholder="Chọn ga"
                        optionFilterProp="label"
                        options={stations.map((station) => ({
                          label: `${station.stationNameVi} (${station.stationNameEn})`,
                          value: station.id,
                        }))}
                      />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)}>
                      Xóa
                    </Button>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Thêm ga
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}

export default MetroLineManagement;
