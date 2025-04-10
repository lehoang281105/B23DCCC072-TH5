import React, { useState } from 'react';
import { Form, Input, Switch, Upload, Image, Button, message } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { ClubData } from '@/models/club';
import { getBase64 } from '@/services/club';
import TinyEditor from '@/pages/ClubManagement/TinyEditor';

interface ClubFormProps {
	initialValues?: Partial<ClubData>;
	onFinish: (values: any) => void;
	isViewMode?: boolean;
}

const ClubForm: React.FC<ClubFormProps> = ({ initialValues, onFinish, isViewMode = false }) => {
	const [form] = Form.useForm();
	const [imageLoading, setImageLoading] = useState(false);
	const [previewImage, setPreviewImage] = useState<string>(initialValues?.avatar || '');
	const [avatarImage, setAvatarImage] = useState<string>(initialValues?.avatar || '');

	if (initialValues) {
		form.setFieldsValue(initialValues);
	}

	const handleSubmit = (values: any) => {
		if (!avatarImage && !values.avatar) {
			message.error('Vui lòng tải lên ảnh đại diện!');
			return;
		}

		const avatarToSave = avatarImage || values.avatar || '';
		if (avatarToSave.length > 524288) {
			message.error('Ảnh quá lớn! Vui lòng chọn ảnh có kích thước nhỏ hơn.');
			return;
		}

		onFinish({
			...values,
			avatar: avatarToSave,
		});
	};

	return (
		<Form form={form} layout='vertical' onFinish={handleSubmit}>
			<Form.Item name='avatar' label='Ảnh đại diện' rules={[{ required: true, message: 'Vui lòng chọn ảnh đại diện' }]}>
				<div>
					{previewImage && (
						<div style={{ marginBottom: 16 }}>
							<Image
								src={previewImage}
								alt='Ảnh đại diện'
								style={{
									maxWidth: '100%',
									maxHeight: '200px',
									marginBottom: 8,
									objectFit: 'contain',
								}}
							/>
						</div>
					)}
					{!isViewMode && (
						<Upload
							listType='picture-card'
							className='avatar-uploader'
							showUploadList={false}
							beforeUpload={(file) => {
								const isImage = file.type.startsWith('image/');
								if (!isImage) {
									message.error('Bạn chỉ có thể tải lên file ảnh!');
									return Upload.LIST_IGNORE;
								}

								const isLt5M = file.size / 1024 / 1024 < 5;
								if (!isLt5M) {
									message.error('Ảnh phải nhỏ hơn 5MB!');
									return Upload.LIST_IGNORE;
								}

								setImageLoading(true);
								getBase64(file)
									.then((base64) => {
										setPreviewImage(base64);
										setAvatarImage(base64);
										form.setFieldsValue({ avatar: base64 });
										message.success('Tải ảnh lên thành công!');
										setImageLoading(false);
									})
									.catch((error) => {
										console.error('Error processing image:', error);
										message.error('Không thể xử lý ảnh. Vui lòng thử lại!');
										setImageLoading(false);
									});

								return false;
							}}
						>
							{imageLoading ? (
								<div>
									<LoadingOutlined />
									<div style={{ marginTop: 8 }}>Đang tải...</div>
								</div>
							) : (
								<div>
									{previewImage ? (
										<img src={previewImage} alt='avatar' style={{ width: '100%' }} />
									) : (
										<div>
											<PlusOutlined />
											<div style={{ marginTop: 8 }}>Tải ảnh lên</div>
										</div>
									)}
								</div>
							)}
						</Upload>
					)}
				</div>
			</Form.Item>

			<Form.Item name='name' label='Tên CLB' rules={[{ required: true, message: 'Vui lòng nhập tên CLB' }]}>
				<Input disabled={isViewMode} />
			</Form.Item>

			<Form.Item name='description' label='Mô tả'>
				{isViewMode ? <div dangerouslySetInnerHTML={{ __html: initialValues?.description || '' }} /> : <TinyEditor />}
			</Form.Item>

			<Form.Item name='chuNhiem' label='Chủ nhiệm CLB'>
				<Input disabled={isViewMode} />
			</Form.Item>

			<Form.Item name='active' label='Hoạt động' valuePropName='checked'>
				<Switch disabled={isViewMode} />
			</Form.Item>
		</Form>
	);
};

export default ClubForm;
