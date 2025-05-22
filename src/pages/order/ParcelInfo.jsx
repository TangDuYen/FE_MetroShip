import { Checkbox, Form, Input, InputNumber, Select } from 'antd';

import React from 'react';

const { TextArea } = Input;
const { Option } = Select;

function ParcelInfo({ parcelInfo, setParcelInfo }) {
  const handleChange = (field, value) => {
    setParcelInfo({ ...parcelInfo, [field]: value });
  };

  return (
    <Form layout="vertical" style={{ padding: '1rem' }}>
      <Form.Item label="Parcel Category">
        <Select
          placeholder="Select a category"
          value={parcelInfo.parcelCategory}
          onChange={(value) => handleChange('parcelCategory', value)}
        >
          <Option value="documents">Documents</Option>
          <Option value="electronics">Electronics</Option>
          <Option value="clothing">Clothing</Option>
          <Option value="food">Food</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Weight (kg)">
        <InputNumber
          min={0}
          style={{ width: '100%' }}
          value={parcelInfo.weightKg}
          onChange={(value) => handleChange('weightKg', value)}
        />
      </Form.Item>

      <Form.Item label="Dimensions (cm)">
        <Input.Group compact>
          <InputNumber
            min={0}
            placeholder="Length"
            style={{ width: '33%' }}
            value={parcelInfo.lengthCm}
            onChange={(value) => handleChange('lengthCm', value)}
          />
          <InputNumber
            min={0}
            placeholder="Height"
            style={{ width: '33%' }}
            value={parcelInfo.heightCm}
            onChange={(value) => handleChange('heightCm', value)}
          />
          <InputNumber
            min={0}
            placeholder="Width"
            style={{ width: '33%' }}
            value={parcelInfo.widthCm}
            onChange={(value) => handleChange('widthCm', value)}
          />
        </Input.Group>
      </Form.Item>

      <Form.Item label="Description">
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
          This is a bulk item
        </Checkbox>
      </Form.Item>
    </Form>
  );
}

export default ParcelInfo;
