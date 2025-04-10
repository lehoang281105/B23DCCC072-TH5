import React from 'react';
import { Table, Button, Space, Popconfirm, Tag, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ReportData } from '@/models/report';

interface ReportListProps {
	reports: ReportData[];
	clubNames: Record<string, string>;
	onEdit: (report: ReportData) => void;
	onDelete: (id: string) => void;
	onViewDetails: (report: ReportData) => void;
	onAdd: () => void;
}

const ReportList: React.FC<ReportListProps> = ({ reports, clubNames, onEdit, onDelete, onViewDetails, onAdd }) => {
	const columns: ColumnsType<ReportData> = [
		{
			title: 'Câu lạc bộ',
			dataIndex: 'clubId',
			width: 150,
			render: (clubId) => clubNames[clubId] || 'Không xác định',
		},
		{
			title: 'Tiêu đề',
			dataIndex: 'title',
			width: 200,
		},
		{
			title: 'Ngày diễn ra',
			dataIndex: 'date',
			width: 120,
			sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
			render: (date) => {
				const formattedDate = new Date(date).toLocaleDateString('vi-VN');
				return <span>{formattedDate}</span>;
			},
		},
		{
			title: 'Số người tham gia',
			dataIndex: 'participants',
			width: 120,
			sorter: (a, b) => a.participants - b.participants,
		},
		{
			title: 'Hình ảnh',
			dataIndex: 'images',
			width: 150,
			render: (images) => {
				if (!images || images.length === 0) {
					return <span>Không có hình ảnh</span>;
				}
				return (
					<Image.PreviewGroup>
						<div style={{ display: 'flex', gap: '4px' }}>
							{images.slice(0, 3).map((image: string, index: number) => (
								<Image
									key={index}
									src={image}
									width={60}
									height={60}
									style={{ objectFit: 'cover' }}
									alt={`Hình ảnh ${index + 1}`}
								/>
							))}
							{images.length > 3 && (
								<div
									style={{
										width: 60,
										height: 60,
										background: 'rgba(0,0,0,0.6)',
										color: 'white',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										borderRadius: '2px',
									}}
								>
									+{images.length - 3}
								</div>
							)}
						</div>
					</Image.PreviewGroup>
				);
			},
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			width: 120,
			render: (status) => (
				<Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</Tag>
			),
		},
		{
			title: 'Thao tác',
			width: 200,
			render: (_, record) => (
				<Space>
					<Button icon={<EyeOutlined />} onClick={() => onViewDetails(record)} />
					<Button icon={<EditOutlined />} onClick={() => onEdit(record)} />
					<Popconfirm title='Xóa báo cáo?' onConfirm={() => onDelete(record.id)}>
						<Button danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<Button type='primary' icon={<PlusOutlined />} onClick={onAdd} style={{ marginBottom: 16 }}>
				Thêm báo cáo
			</Button>
			<Table
				rowKey='id'
				dataSource={reports}
				columns={columns}
				expandable={{
					expandedRowRender: (record) => (
						<div>
							<h4>Nội dung:</h4>
							<div dangerouslySetInnerHTML={{ __html: record.content }} />
						</div>
					),
				}}
			/>
		</div>
	);
};

export default ReportList;
