import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button } from 'antd';
import { KhoaHoc, TrangThaiKhoaHoc, GiangVien } from '@/models/khoahoc';
import TinyEditor from '@/components/TinyEditor';

const { Option } = Select;

// Interface cho props
interface KhoaHocFormProps {
	visible: boolean;
	onCancel: () => void;
	onSave: (values: any) => void;
	khoaHoc: KhoaHoc | null;
	danhSachGiangVien: GiangVien[];
}

// Component form thêm/sửa khóa học
const KhoaHocForm: React.FC<KhoaHocFormProps> = ({ visible, onCancel, onSave, khoaHoc, danhSachGiangVien }) => {
	const [form] = Form.useForm();

	// Reset form khi visible hoặc khoaHoc thay đổi
	useEffect(() => {
		if (visible) {
			if (khoaHoc) {
				// Chỉnh sửa khóa học
				form.setFieldsValue({
					tenKhoaHoc: khoaHoc.tenKhoaHoc,
					giangVien: khoaHoc.giangVien,
					soLuongHocVien: khoaHoc.soLuongHocVien,
					moTa: khoaHoc.moTa,
					trangThai: khoaHoc.trangThai,
				});
			} else {
				// Thêm mới khóa học
				form.resetFields();
				// Giá trị mặc định
				form.setFieldsValue({
					soLuongHocVien: 0,
					trangThai: TrangThaiKhoaHoc.DANG_MO,
				});
			}
		}
	}, [visible, khoaHoc, form]);

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
			title={khoaHoc ? 'Chỉnh sửa khóa học' : 'Thêm mới khóa học'}
			visible={visible}
			onCancel={onCancel}
			width={800}
			footer={[
				<Button key='cancel' onClick={onCancel}>
					Hủy
				</Button>,
				<Button key='submit' type='primary' onClick={handleSubmit}>
					{khoaHoc ? 'Cập nhật' : 'Thêm mới'}
				</Button>,
			]}
		>
			<Form form={form} layout='vertical' requiredMark={false}>
				<Form.Item
					name='tenKhoaHoc'
					label='Tên khóa học'
					rules={[
						{ required: true, message: 'Vui lòng nhập tên khóa học' },
						{ max: 100, message: 'Tên khóa học không được vượt quá 100 ký tự' },
					]}
				>
					<Input placeholder='Nhập tên khóa học' />
				</Form.Item>

				<Form.Item
					name='giangVien'
					label='Giảng viên'
					rules={[{ required: true, message: 'Vui lòng chọn giảng viên' }]}
				>
					<Select placeholder='Chọn giảng viên'>
						{danhSachGiangVien.map((giangVien) => (
							<Option key={giangVien.id} value={giangVien.tenGiangVien}>
								{giangVien.tenGiangVien}
							</Option>
						))}
					</Select>
				</Form.Item>

				<Form.Item
					name='soLuongHocVien'
					label='Số lượng học viên'
					rules={[
						{ required: true, message: 'Vui lòng nhập số lượng học viên' },
						{ type: 'number', min: 0, message: 'Số lượng học viên không được âm' },
					]}
				>
					<InputNumber style={{ width: '100%' }} placeholder='Nhập số lượng học viên' />
				</Form.Item>

				<Form.Item
					name='moTa'
					label='Mô tả khóa học'
					rules={[{ required: true, message: 'Vui lòng nhập mô tả khóa học' }]}
				>
					<TinyEditor height={300} />
				</Form.Item>

				<Form.Item
					name='trangThai'
					label='Trạng thái'
					rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
				>
					<Select placeholder='Chọn trạng thái'>
						{Object.values(TrangThaiKhoaHoc).map((trangThai) => (
							<Option key={trangThai} value={trangThai}>
								{trangThai}
							</Option>
						))}
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default KhoaHocForm;
