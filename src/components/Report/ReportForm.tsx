import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Upload, Image, message } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import moment from 'moment';
import { ClubData } from '@/models/club';
import { ReportData } from '@/models/report';
import { getClubs } from '@/services/club';
import { processImages } from '@/services/report';
import TinyEditor from '@/pages/ClubManagement/TinyEditor';

interface ReportFormProps {
	initialValues?: Partial<ReportData>;
	onFinish: (values: any) => void;
	isViewMode?: boolean;
}

const ReportForm: React.FC<ReportFormProps> = ({ initialValues, onFinish, isViewMode = false }) => {
	const [form] = Form.useForm();
	const [clubs, setClubs] = useState<ClubData[]>([]);
	const [previewImages, setPreviewImages] = useState<string[]>(initialValues?.images || []);
	const [imagesList, setImagesList] = useState<string[]>(initialValues?.images || []);
	const [imageLoading, setImageLoading] = useState(false);

	useEffect(() => {
		const fetchClubs = async () => {
			try {
				const data = await getClubs();
				setClubs(data);
			} catch (error) {
				console.error('Error fetching clubs:', error);
			}
		};

		fetchClubs();
	}, []);

	useEffect(() => {
		if (initialValues) {
			// Handle date formatting for the form
			const formattedValues = {
				...initialValues,
				date: initialValues.date ? moment(initialValues.date) : null,
			};
			form.setFieldsValue(formattedValues);
			setPreviewImages(initialValues.images || []);
			setImagesList(initialValues.images || []);
		}
	}, [initialValues, form]);

	const handleSubmit = (values: any) => {
		const formattedValues = {
			...values,
			date: values.date ? values.date.format('YYYY-MM-DD') : '',
			images: imagesList,
		};
		onFinish(formattedValues);
	};

	const handleImageUpload = async (file: File) => {
		if (!file) return;

		try {
			setImageLoading(true);
			const fileList = [file];
			const uploadedImages = await processImages(fileList);

			setImagesList([...imagesList, ...uploadedImages]);
			setPreviewImages([...previewImages, ...uploadedImages]);
			message.success('Tải ảnh lên thành công!');
		} catch (error) {
			console.error('Error uploading image:', error);
			message.error('Không thể tải lên ảnh. Vui lòng thử lại!');
		} finally {
			setImageLoading(false);
		}
	};

	const removeImage = (index: number) => {
		const newImagesList = [...imagesList];
		const newPreviewImages = [...previewImages];
		newImagesList.splice(index, 1);
		newPreviewImages.splice(index, 1);
		setImagesList(newImagesList);
		setPreviewImages(newPreviewImages);
	};

	return (
		<Form form={form} layout='vertical' onFinish={handleSubmit}>
			<Form.Item name='clubId' label='Câu lạc bộ' rules={[{ required: true, message: 'Vui lòng chọn câu lạc bộ' }]}>
				<Select disabled={isViewMode}>
					{clubs.map((club) => (
						<Select.Option key={club.id} value={club.id}>
							{club.name}
						</Select.Option>
					))}
				</Select>
			</Form.Item>

			<Form.Item name='title' label='Tiêu đề' rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
				<Input disabled={isViewMode} />
			</Form.Item>

			<Form.Item
				name='content'
				label='Nội dung báo cáo'
				rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
			>
				{isViewMode ? <div dangerouslySetInnerHTML={{ __html: initialValues?.content || '' }} /> : <TinyEditor />}
			</Form.Item>

			<Form.Item name='date' label='Ngày diễn ra' rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
				<DatePicker disabled={isViewMode} format='DD/MM/YYYY' style={{ width: '100%' }} />
			</Form.Item>

			<Form.Item
				name='participants'
				label='Số người tham gia'
				rules={[{ required: true, message: 'Vui lòng nhập số người tham gia' }]}
			>
				<InputNumber disabled={isViewMode} min={0} style={{ width: '100%' }} />
			</Form.Item>

			<Form.Item name='images' label='Hình ảnh hoạt động'>
				<div>
					<div
						className='image-preview-container'
						style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}
					>
						{previewImages.map((image, index) => (
							<div key={index} style={{ position: 'relative', marginBottom: '8px' }}>
								<Image src={image} width={200} />
								{!isViewMode && (
									<button
										type='button'
										onClick={() => removeImage(index)}
										style={{
											position: 'absolute',
											top: '5px',
											right: '5px',
											background: 'rgba(0, 0, 0, 0.65)',
											color: '#fff',
											border: 'none',
											borderRadius: '50%',
											width: '22px',
											height: '22px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											cursor: 'pointer',
										}}
									>
										×
									</button>
								)}
							</div>
						))}
					</div>

					{!isViewMode && (
						<Upload
							listType='picture-card'
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

								handleImageUpload(file);
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
									<PlusOutlined />
									<div style={{ marginTop: 8 }}>Tải ảnh lên</div>
								</div>
							)}
						</Upload>
					)}
				</div>
			</Form.Item>

			<Form.Item name='status' label='Trạng thái' initialValue='active'>
				<Select disabled={isViewMode}>
					<Select.Option value='active'>Hoạt động</Select.Option>
					<Select.Option value='inactive'>Không hoạt động</Select.Option>
				</Select>
			</Form.Item>
		</Form>
	);
};

export default ReportForm;
