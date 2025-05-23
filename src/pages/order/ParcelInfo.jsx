import { Checkbox, Form, Input, InputNumber, Select } from 'antd';

import React from 'react';
import Title from 'antd/es/skeleton/Title';

const { TextArea } = Input;
const { Option } = Select;

function ParcelInfo({ parcelInfo, setParcelInfo }) {
  const handleChange = (field, value) => {
    setParcelInfo({ ...parcelInfo, [field]: value });
  };

  return (
    <>
      <Title level={4}>Điền thông tin kiện hàng</Title>
      <Form layout="vertical" style={{ padding: '1rem' }}>
        <Title level={4}>Chọn trạm Metro</Title>
        <Form.Item label="Loại hàng hóa">
          <Select
            placeholder="Chọn loại hàng"
            value={parcelInfo.parcelCategory}
            onChange={(value) => handleChange('parcelCategory', value)}
          >
            <Option value="documents">Tài liệu</Option>
            <Option value="electronics">Hàng điện tử</Option>
            <Option value="clothing">Quần áo</Option>
            <Option value="food">Đồ ăn</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Trọng lượng (kg)">
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            value={parcelInfo.weightKg}
            onChange={(value) => handleChange('weightKg', value)}
          />
        </Form.Item>

        <Form.Item label="Kích thước (cm)">
          <Input.Group compact>
            <InputNumber
              min={0}
              placeholder="Dài"
              style={{ width: '33%' }}
              value={parcelInfo.lengthCm}
              onChange={(value) => handleChange('lengthCm', value)}
            />
            <InputNumber
              min={0}
              placeholder="Rộng"
              style={{ width: '33%' }}
              value={parcelInfo.widthCm}
              onChange={(value) => handleChange('widthCm', value)}
            />
            <InputNumber
              min={0}
              placeholder="Cao"
              style={{ width: '33%' }}
              value={parcelInfo.heightCm}
              onChange={(value) => handleChange('heightCm', value)}
            />
            
          </Input.Group>
        </Form.Item>

        <Form.Item label="Mô tả">
          <TextArea
            rows={4}
            value={parcelInfo.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </Form.Item>

        <Form.Item>
          <Checkbox
            checked={parcelInfo.isBulk}
            onChange={(e) => handleChange('isBulk', e.target.checked)}
          >
            Gửi nhiều hàng
          </Checkbox>
        </Form.Item>
      </Form></>

  );
}

export default ParcelInfo;
