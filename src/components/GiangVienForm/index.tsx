import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { GiangVien } from '@/models/khoahoc';

// Interface cho props
interface GiangVienFormProps {
	visible: boolean;
	onCancel: () => void;
	onSave: (values: any) => void;
	giangVien: GiangVien | null;
}

// Component form thêm/sửa giảng viên
const GiangVienForm: React.FC<GiangVienFormProps> = ({ visible, onCancel, onSave, giangVien }) => {
	const [form] = Form.useForm();

	// Reset form khi visible hoặc giangVien thay đổi
	useEffect(() => {
		if (visible) {
			if (giangVien) {
				// Chỉnh sửa giảng viên
				form.setFieldsValue({
					tenGiangVien: giangVien.tenGiangVien,
				});
			} else {
				// Thêm mới giảng viên
				form.resetFields();
			}
		}
	}, [visible, giangVien, form]);

	// Hàm xử lý khi submit form
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			onSave(values);
		} catch (error) {
			console.error('Validation failed:', error);
		}
	};

	return (
		<Modal
			title={giangVien ? 'Chỉnh sửa giảng viên' : 'Thêm mới giảng viên'}
			visible={visible}
			onCancel={onCancel}
			width={500}
			footer={[
				<Button key='cancel' onClick={onCancel}>
					Hủy
				</Button>,
				<Button key='submit' type='primary' onClick={handleSubmit}>
					{giangVien ? 'Cập nhật' : 'Thêm mới'}
				</Button>,
			]}
		>
			<Form form={form} layout='vertical' requiredMark={false}>
				<Form.Item
					name='tenGiangVien'
					label='Tên giảng viên'
					rules={[
						{ required: true, message: 'Vui lòng nhập tên giảng viên' },
						{ max: 100, message: 'Tên giảng viên không được vượt quá 100 ký tự' },
					]}
				>
					<Input placeholder='Nhập tên giảng viên' />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default GiangVienForm;
