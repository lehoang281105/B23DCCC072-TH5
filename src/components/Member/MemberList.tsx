import React from 'react';
import { Table, Button, Space, Popconfirm, Input } from 'antd';
import {
	PlusOutlined,
	EditOutlined,
	DeleteOutlined,
	CheckOutlined,
	CloseOutlined,
	EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MemberData } from '@/models/member';

interface MemberListProps {
	members: MemberData[];
	clubNames: Record<string, string>;
	selectedRows: string[];
	onSelectChange: (selectedRowKeys: React.Key[]) => void;
	onEdit: (member: MemberData) => void;
	onDelete: (id: string) => void;
	onApprove: (id: string) => void;
	onReject: (id: string) => void;
	onViewDetails: (member: MemberData) => void;
	onViewHistory: (history?: string[] | string) => void;
	onAdd: () => void;
	onBulkApprove: () => void;
	onBulkReject: () => void;
	onBulkDelete: () => void;
}

const MemberList: React.FC<MemberListProps> = ({
	members,
	clubNames,
	selectedRows,
	onSelectChange,
	onEdit,
	onDelete,
	onApprove,
	onReject,
	onViewDetails,
	onViewHistory,
	onAdd,
	onBulkApprove,
	onBulkReject,
	onBulkDelete,
}) => {
	const columns: ColumnsType<MemberData> = [
		{
			title: 'Họ tên',
			dataIndex: 'name',
			sorter: (a, b) => a.name.localeCompare(b.name),
			filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
				<div style={{ padding: 8 }}>
					<Input
						placeholder='Tìm tên học viên'
						value={selectedKeys[0]}
						onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
						onPressEnter={() => confirm()}
						style={{ marginBottom: 8, display: 'block' }}
					/>
					<Space>
						<Button type='primary' onClick={() => confirm()} size='small' style={{ width: 90 }}>
							Tìm kiếm
						</Button>
						<Button onClick={() => clearFilters && clearFilters()} size='small' style={{ width: 90 }}>
							Xóa
						</Button>
					</Space>
				</div>
			),
			onFilter: (value: any, record: MemberData) => record.name.toLowerCase().includes((value as string).toLowerCase()),
		},
		{ title: 'Email', dataIndex: 'email' },
		{ title: 'SĐT', dataIndex: 'phone' },
		{ title: 'Giới tính', dataIndex: 'gender', render: (gender) => (gender === 'Male' ? 'Nam' : 'Nữ') },
		{ title: 'Địa chỉ', dataIndex: 'address' },
		{ title: 'Sở trường', dataIndex: 'skills' },
		{
			title: 'Câu lạc bộ',
			dataIndex: 'club',
			render: (clubId) => clubNames[clubId] || 'Không xác định',
		},
		{ title: 'Lý do đăng ký', dataIndex: 'reason' },
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			filters: [
				{ text: 'Pending', value: 'Pending' },
				{ text: 'Approved', value: 'Approved' },
				{ text: 'Rejected', value: 'Rejected' },
			],
			onFilter: (value: any, record: MemberData) => record.status === value,
			render: (status: string) => {
				if (status === 'Approved') return <span style={{ color: 'green' }}>Chấp nhận</span>;
				if (status === 'Rejected') return <span style={{ color: 'red' }}>Từ chối</span>;
				return <span style={{ color: 'blue' }}>Chờ duyệt</span>;
			},
		},
		{
			title: 'Thao tác',
			render: (_, record) => (
				<Space>
					<Button icon={<EyeOutlined />} onClick={() => onViewDetails(record)} />
					<Button
						icon={<CheckOutlined />}
						type='primary'
						onClick={() => onApprove(record.id)}
						disabled={record.status === 'Approved'}
					/>
					<Button
						icon={<CloseOutlined />}
						danger
						onClick={() => onReject(record.id)}
						disabled={record.status === 'Rejected'}
					/>
					<Button icon={<EditOutlined />} onClick={() => onEdit(record)} disabled={record.status === 'Approved'} />
					<Popconfirm title='Xóa đơn đăng ký?' onConfirm={() => onDelete(record.id)}>
						<Button danger icon={<DeleteOutlined />} />
					</Popconfirm>
					<Button type='link' onClick={() => onViewHistory(record.history)}>
						Xem lịch sử
					</Button>
				</Space>
			),
		},
	];

	return (
		<div>
			<Button type='primary' icon={<PlusOutlined />} onClick={onAdd} style={{ marginBottom: 16, marginRight: 8 }}>
				Thêm mới
			</Button>
			<Button type='primary' onClick={onBulkApprove} disabled={!selectedRows.length} style={{ marginRight: 8 }}>
				Duyệt {selectedRows.length} đơn đã chọn
			</Button>
			<Button danger onClick={onBulkReject} disabled={!selectedRows.length} style={{ marginRight: 8 }}>
				Không duyệt {selectedRows.length} đơn đã chọn
			</Button>
			<Button danger onClick={onBulkDelete} disabled={!selectedRows.length}>
				Xóa {selectedRows.length} đơn đã chọn
			</Button>
			<Table
				rowKey='id'
				dataSource={members}
				columns={columns}
				rowSelection={{
					selectedRowKeys: selectedRows,
					onChange: onSelectChange,
				}}
			/>
		</div>
	);
};

export default MemberList;
