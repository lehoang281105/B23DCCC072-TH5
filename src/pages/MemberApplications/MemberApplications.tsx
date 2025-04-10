import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, Space, message } from 'antd';
import {
	EditOutlined,
	DeleteOutlined,
	CheckOutlined,
	CloseOutlined,
	PlusOutlined,
	EyeOutlined,
} from '@ant-design/icons';

interface Application {
	id: string;
	name: string;
	email: string;
	phone: string;
	gender: string;
	address: string;
	skills: string;
	club: string;
	reason: string;
	status: 'Pending' | 'Approved' | 'Rejected';
	note?: string;
	history?: string[];
}

interface Club {
	id: string;
	name: string;
}

const MemberApplications: React.FC = () => {
	const [applications, setApplications] = useState<Application[]>([]);
	const [clubs, setClubs] = useState<Club[]>([]); // Thêm trạng thái để lưu danh sách câu lạc bộ
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isViewMode, setIsViewMode] = useState(false);
	const [editingApplication, setEditingApplication] = useState<Application | null>(null);
	const [form] = Form.useForm();
	const [refresh, setRefresh] = useState(false); // Trạng thái để làm mới dữ liệu

	// Lấy danh sách đơn đăng ký
	const fetchApplications = () => {
		fetch('https://67f74a7a42d6c71cca64966c.mockapi.io/students')
			.then((res) => res.json())
			.then((data) => setApplications(data))
			.catch((err) => console.error('Error fetching applications:', err));
	};

	// Lấy danh sách câu lạc bộ
	const fetchClubs = () => {
		fetch('https://67f72b6542d6c71cca643b99.mockapi.io/Clb')
			.then((res) => res.json())
			.then((data) => setClubs(data))
			.catch((err) => console.error('Error fetching clubs:', err));
	};

	useEffect(() => {
		fetchApplications();
		fetchClubs(); // Gọi API để lấy danh sách câu lạc bộ
	}, [refresh]); // Lắng nghe trạng thái refresh

	const updateApplicationStatus = (id: string, status: 'Approved' | 'Rejected', note?: string) => {
		const timestamp = new Date().toLocaleString();
		const historyEntry = `Admin đã ${status === 'Approved' ? 'duyệt' : 'từ chối'} vào lúc ${timestamp} ${
			note ? `với lý do: ${note}` : ''
		}`;

		fetch(`https://67f74a7a42d6c71cca64966c.mockapi.io/students/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status, note, history: historyEntry }),
		})
			.then(() => {
				setApplications((prev) =>
					prev.map((app) =>
						app.id === id ? { ...app, status, note, history: [...(app.history || []), historyEntry] } : app,
					),
				);
				message.success(`Application ${status.toLowerCase()} successfully!`);
			})
			.catch((err) => console.error('Error updating application status:', err));
	};

	const handleApprove = (id: string) => {
		updateApplicationStatus(id, 'Approved');
	};

	const handleReject = (id: string) => {
		let rejectNote = ''; // Biến để lưu lý do từ chối tạm thời

		Modal.confirm({
			title: 'Từ chối đơn đăng ký',
			content: (
				<Input.TextArea
					placeholder='Nhập lý do từ chối'
					onChange={(e) => {
						rejectNote = e.target.value; // Lưu giá trị vào biến tạm thời
					}}
					rows={4}
				/>
			),
			okText: 'Từ chối',
			cancelText: 'Hủy',
			onOk: () => {
				if (rejectNote.trim()) {
					updateApplicationStatus(id, 'Rejected', rejectNote); // Gọi API với lý do từ chối
				} else {
					message.error('Vui lòng nhập lý do từ chối trước khi xác nhận!');
					return Promise.reject(); // Ngăn modal đóng nếu không có lý do
				}
			},
		});
	};

	const handleDelete = (id: string) => {
		const application = applications.find((app) => app.id === id);

		if (application?.status === 'Approved') {
			// Nếu trạng thái là Approved, chỉ xóa khỏi bảng
			setApplications((prev) => prev.filter((app) => app.id !== id));
			message.success('Đã xóa đơn đăng ký khỏi bảng nhưng giữ lại dữ liệu sinh viên đã được duyệt!');
			return;
		}

		// Nếu trạng thái là Pending hoặc Rejected, xóa khỏi cơ sở dữ liệu
		fetch(`https://67f74a7a42d6c71cca64966c.mockapi.io/students/${id}`, {
			method: 'DELETE',
		})
			.then(() => {
				setApplications((prev) => prev.filter((app) => app.id !== id));
				message.success('Xóa đơn đăng ký thành công!');
			})
			.catch((err) => console.error('Error deleting application:', err));
	};

	const handleBulkApprove = () => {
		selectedRows.forEach((id) => handleApprove(id));
		setSelectedRows([]);
	};

	const handleBulkReject = () => {
		let rejectNote = ''; // Biến tạm thời để lưu lý do từ chối

		Modal.confirm({
			title: 'Từ chối các đơn đăng ký đã chọn',
			content: (
				<Input.TextArea
					placeholder='Nhập lý do từ chối'
					onChange={(e) => {
						rejectNote = e.target.value; // Lưu giá trị vào biến tạm thời
					}}
					rows={4}
				/>
			),
			okText: 'Từ chối',
			cancelText: 'Hủy',
			onOk: () => {
				if (rejectNote.trim()) {
					// Gọi API cho từng đơn đăng ký được chọn
					selectedRows.forEach((id) => {
						updateApplicationStatus(id, 'Rejected', rejectNote);
					});
					setSelectedRows([]); // Xóa các hàng đã chọn
					message.success('Đã từ chối các đơn đăng ký!');
				} else {
					message.error('Vui lòng nhập lý do từ chối trước khi xác nhận!');
					return Promise.reject(); // Ngăn modal đóng nếu không có lý do
				}
			},
		});
	};

	const handleBulkDelete = () => {
		const approvedApplications = selectedRows.filter((id) => {
			const application = applications.find((app) => app.id === id);
			return application?.status === 'Approved';
		});

		const deletableApplications = selectedRows.filter((id) => {
			const application = applications.find((app) => app.id === id);
			return application?.status !== 'Approved';
		});

		// Xóa các đơn Approved khỏi bảng
		if (approvedApplications.length > 0) {
			setApplications((prev) => prev.filter((app) => !approvedApplications.includes(app.id)));
			message.success(
				`Đã xóa ${approvedApplications.length} đơn đăng ký khỏi bảng nhưng giữ lại dữ liệu sinh viên đã được duyệt!`,
			);
		}

		// Xóa các đơn Pending hoặc Rejected khỏi cơ sở dữ liệu
		if (deletableApplications.length > 0) {
			Promise.all(
				deletableApplications.map((id) =>
					fetch(`https://67f74a7a42d6c71cca64966c.mockapi.io/students/${id}`, {
						method: 'DELETE',
					}),
				),
			)
				.then(() => {
					setApplications((prev) => prev.filter((app) => !deletableApplications.includes(app.id)));
					message.success(`Đã xóa ${deletableApplications.length} đơn đăng ký khỏi cơ sở dữ liệu!`);
				})
				.catch((err) => console.error('Error deleting applications:', err));
		}

		setSelectedRows([]); // Xóa các hàng đã chọn
	};

	const handleAddNew = () => {
		setEditingApplication(null);
		setIsViewMode(false);
		form.resetFields();
		setIsModalOpen(true);
	};

	const handleViewDetails = (application: Application) => {
		setEditingApplication(application);
		form.setFieldsValue(application);
		setIsViewMode(true);
		setIsModalOpen(true);
	};

	const handleEditModal = (application: Application) => {
		setEditingApplication(application);
		form.setFieldsValue(application);
		setIsViewMode(false);
		setIsModalOpen(true);
	};

	const showHistory = (history?: string[] | string) => {
		const historyArray = Array.isArray(history) ? history : [history].filter(Boolean);
		setRefresh((prev) => !prev); // Chuyển thành mảng nếu cần
		Modal.info({
			title: 'Lịch sử thao tác',
			content: (
				<ul>
					{historyArray.length > 0 ? (
						historyArray.map((entry, index) => <li key={index}>{entry}</li>)
					) : (
						<p>Không có lịch sử</p>
					)}
				</ul>
			),
			onOk: () => {},
		});
	};

	const columns = [
		{
			title: 'Họ tên',
			dataIndex: 'name',
			sorter: (a: Application, b: Application) => a.name.localeCompare(b.name),
			filterDropdown: ({
				setSelectedKeys,
				selectedKeys,
				confirm,
				clearFilters,
			}: {
				setSelectedKeys: (keys: React.Key[]) => void;
				selectedKeys: React.Key[];
				confirm: () => void;
				clearFilters?: () => void;
			}) => (
				<div style={{ padding: 8 }}>
					<Input
						placeholder='Tìm theo họ tên'
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
			onFilter: (value: string | number | boolean, record: Application) =>
				record.name.toLowerCase().includes((value as string).toLowerCase()),
		},
		{
			title: 'Email',
			dataIndex: 'email',
			sorter: (a: Application, b: Application) => a.email.localeCompare(b.email),
		},
		{
			title: 'SĐT',
			dataIndex: 'phone',
			sorter: (a: Application, b: Application) => a.phone.localeCompare(b.phone),
		},
		{
			title: 'Giới tính',
			dataIndex: 'gender',
			render: (gender: string) => (gender === 'Male' ? 'Nam' : 'Nữ'),
		},
		{ title: 'Địa chỉ', dataIndex: 'address' },
		{ title: 'Sở trường', dataIndex: 'skills' },
		{ title: 'Câu lạc bộ', dataIndex: 'club' },
		{ title: 'Lý do đăng ký', dataIndex: 'reason' },
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			render: (status: string) => (
				<span style={{ color: status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange' }}>
					{status}
				</span>
			),
		},
		{
			title: 'Thao tác',
			render: (_: any, record: Application) => (
				<Space>
					<Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
					<Button icon={<EditOutlined />} onClick={() => handleEditModal(record)} />
					<Popconfirm title='Xóa đơn đăng ký?' onConfirm={() => handleDelete(record.id)}>
						<Button danger icon={<DeleteOutlined />} />
					</Popconfirm>
					<Button icon={<CheckOutlined />} onClick={() => handleApprove(record.id)} />
					<Button icon={<CloseOutlined />} onClick={() => handleReject(record.id)} />
					<Button onClick={() => showHistory(record.history)}>Xem lịch sử</Button>
				</Space>
			),
		},
	];

	const handleSave = (values: Application) => {
		if (editingApplication) {
			// Chỉnh sửa đơn đăng ký
			fetch(`https://67f74a7a42d6c71cca64966c.mockapi.io/students/${editingApplication.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			})
				.then(() => {
					message.success('Cập nhật đơn đăng ký thành công!');
					setEditingApplication(null);
					setIsModalOpen(false);
					setRefresh((prev) => !prev); // Làm mới dữ liệu
				})
				.catch((err) => console.error('Error saving application:', err));
		} else {
			// Thêm mới đơn đăng ký
			const newApplication = { ...values, status: 'Pending' }; // Đặt trạng thái mặc định là Pending
			fetch('https://67f74a7a42d6c71cca64966c.mockapi.io/students', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newApplication),
			})
				.then((res) => res.json())
				.then(() => {
					message.success('Thêm mới đơn đăng ký thành công!');
					setIsModalOpen(false);
					setRefresh((prev) => !prev); // Làm mới dữ liệu
				})
				.catch((err) => console.error('Error adding application:', err));
		}
	};

	return (
		<div>
			<Button type='primary' icon={<PlusOutlined />} onClick={handleAddNew} style={{ marginBottom: 16 }}>
				Thêm mới
			</Button>
			<Button type='primary' onClick={handleBulkApprove} disabled={!selectedRows.length}>
				Duyệt {selectedRows.length} đơn đã chọn
			</Button>
			<Button danger onClick={handleBulkReject} disabled={!selectedRows.length}>
				Không duyệt {selectedRows.length} đơn đã chọn
			</Button>
			<Button danger onClick={handleBulkDelete} disabled={!selectedRows.length}>
				Xóa {selectedRows.length} đơn đã chọn
			</Button>
			<Table
				rowKey='id'
				dataSource={applications}
				columns={columns}
				rowSelection={{
					selectedRowKeys: selectedRows,
					onChange: (selectedRowKeys: React.Key[]) => setSelectedRows(selectedRowKeys as string[]),
				}}
			/>
			<Modal
				title={
					isViewMode
						? 'Xem chi tiết đơn đăng ký'
						: editingApplication
						? 'Chỉnh sửa đơn đăng ký'
						: 'Thêm mới đơn đăng ký'
				}
				visible={isModalOpen}
				onCancel={() => setIsModalOpen(false)}
				onOk={() => !isViewMode && form.submit()}
				okButtonProps={{ disabled: isViewMode }}
			>
				<Form form={form} layout='vertical' onFinish={handleSave}>
					<Form.Item name='name' label='Họ tên' rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
						<Input disabled={isViewMode} />
					</Form.Item>
					<Form.Item name='email' label='Email' rules={[{ required: true, message: 'Vui lòng nhập email' }]}>
						<Input disabled={isViewMode} />
					</Form.Item>
					<Form.Item name='phone' label='SĐT' rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
						<Input disabled={isViewMode} />
					</Form.Item>
					<Form.Item name='gender' label='Giới tính' rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}>
						<Select disabled={isViewMode}>
							<Select.Option value='Male'>Nam</Select.Option>
							<Select.Option value='Female'>Nữ</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item name='address' label='Địa chỉ'>
						<Input disabled={isViewMode} />
					</Form.Item>
					<Form.Item name='skills' label='Sở trường'>
						<Input disabled={isViewMode} />
					</Form.Item>
					<Form.Item name='club' label='Câu lạc bộ' rules={[{ required: true, message: 'Vui lòng chọn câu lạc bộ' }]}>
						<Select disabled={isViewMode}>
							{clubs.map((club) => (
								<Select.Option key={club.id} value={club.name}>
									{club.name}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='reason' label='Lý do đăng ký'>
						<Input.TextArea disabled={isViewMode} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default MemberApplications;
