import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Input, Row, Table, Select, Space, Popconfirm, message, Tag, Tabs } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { useDispatch, useSelector } from 'umi';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { KhoaHoc, TrangThaiKhoaHoc, GiangVien } from '@/models/khoahoc';
import KhoaHocForm from '@/components/KhoaHocForm';
import GiangVienForm from '@/components/GiangVienForm';

const { Option } = Select;
const { TabPane } = Tabs;

// Component Trang Danh Sách Khóa Học và Giảng Viên
const KhoaHocPage: React.FC = () => {
	const dispatch = useDispatch();
	const { danhSachKhoaHoc, danhSachGiangVien } = useSelector((state: any) => state.khoahoc);

	// State local cho khóa học
	const [keyword, setKeyword] = useState<string>('');
	const [giangVienFilter, setGiangVienFilter] = useState<string | null>(null);
	const [trangThai, setTrangThai] = useState<TrangThaiKhoaHoc | null>(null);
	const [visibleKhoaHocModal, setVisibleKhoaHocModal] = useState<boolean>(false);
	const [editingKhoaHoc, setEditingKhoaHoc] = useState<KhoaHoc | null>(null);

	// State local cho giảng viên
	const [keywordGiangVien, setKeywordGiangVien] = useState<string>('');
	const [visibleGiangVienModal, setVisibleGiangVienModal] = useState<boolean>(false);
	const [editingGiangVien, setEditingGiangVien] = useState<GiangVien | null>(null);

	// Fetch dữ liệu khi component mount
	useEffect(() => {
		dispatch({
			type: 'khoahoc/fetchKhoaHoc',
		});

		dispatch({
			type: 'khoahoc/fetchGiangVien',
		});
	}, [dispatch]);

	// Hàm lọc danh sách khóa học
	const getDanhSachKhoaHocLoc = () => {
		let result = [...danhSachKhoaHoc];

		// Lọc theo keyword
		if (keyword) {
			result = result.filter((item) => item.tenKhoaHoc.toLowerCase().includes(keyword.toLowerCase()));
		}

		// Lọc theo giảng viên
		if (giangVienFilter) {
			result = result.filter((item) => item.giangVien === giangVienFilter);
		}

		// Lọc theo trạng thái
		if (trangThai) {
			result = result.filter((item) => item.trangThai === trangThai);
		}

		return result;
	};

	// Hàm lọc danh sách giảng viên
	const getDanhSachGiangVienLoc = () => {
		let result = [...danhSachGiangVien];

		// Lọc theo keyword
		if (keywordGiangVien) {
			result = result.filter((item) => item.tenGiangVien.toLowerCase().includes(keywordGiangVien.toLowerCase()));
		}

		return result;
	};

	// Hàm thêm/sửa khóa học
	const handleSaveKhoaHoc = async (values: any) => {
		if (editingKhoaHoc) {
			// Cập nhật khóa học
			const success = await dispatch({
				type: 'khoahoc/updateKhoaHoc',
				payload: {
					...editingKhoaHoc,
					...values,
				},
			});

			if (success) {
				setVisibleKhoaHocModal(false);
				setEditingKhoaHoc(null);
			}
		} else {
			// Thêm mới khóa học
			const success = await dispatch({
				type: 'khoahoc/addKhoaHoc',
				payload: values,
			});

			if (success) {
				setVisibleKhoaHocModal(false);
			}
		}
	};

	// Hàm thêm/sửa giảng viên
	const handleSaveGiangVien = async (values: any) => {
		if (editingGiangVien) {
			// Cập nhật giảng viên
			const success = await dispatch({
				type: 'khoahoc/updateGiangVien',
				payload: {
					...editingGiangVien,
					...values,
				},
			});

			if (success) {
				setVisibleGiangVienModal(false);
				setEditingGiangVien(null);
			}
		} else {
			// Thêm mới giảng viên
			const success = await dispatch({
				type: 'khoahoc/addGiangVien',
				payload: values,
			});

			if (success) {
				setVisibleGiangVienModal(false);
			}
		}
	};

	// Hàm xóa khóa học
	const handleDeleteKhoaHoc = (id: string) => {
		dispatch({
			type: 'khoahoc/deleteKhoaHoc',
			payload: id,
		});
	};

	// Hàm xóa giảng viên
	const handleDeleteGiangVien = (id: string) => {
		dispatch({
			type: 'khoahoc/deleteGiangVien',
			payload: id,
		});
	};

	// Cấu hình cột cho bảng
	const columnsKhoaHoc = [
		{
			title: 'ID',
			dataIndex: 'id',
			key: 'id',
			width: 100,
		},
		{
			title: 'Tên khóa học',
			dataIndex: 'tenKhoaHoc',
			key: 'tenKhoaHoc',
			sorter: (a: KhoaHoc, b: KhoaHoc) => a.tenKhoaHoc.localeCompare(b.tenKhoaHoc),
		},
		{
			title: 'Giảng viên',
			dataIndex: 'giangVien',
			key: 'giangVien',
		},
		{
			title: 'Số lượng học viên',
			dataIndex: 'soLuongHocVien',
			key: 'soLuongHocVien',
			sorter: (a: KhoaHoc, b: KhoaHoc) => a.soLuongHocVien - b.soLuongHocVien,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'trangThai',
			key: 'trangThai',
			render: (trangThaiValue: TrangThaiKhoaHoc) => {
				let color = 'green';
				if (trangThaiValue === TrangThaiKhoaHoc.DA_KET_THUC) {
					color = 'red';
				} else if (trangThaiValue === TrangThaiKhoaHoc.TAM_DUNG) {
					color = 'orange';
				}
				return <Tag color={color}>{trangThaiValue}</Tag>;
			},
		},
		{
			title: 'Thao tác',
			key: 'action',
			width: 150,
			render: (_: any, record: KhoaHoc) => (
				<Space>
					<Button
						type='primary'
						icon={<EditOutlined />}
						size='small'
						onClick={() => {
							setEditingKhoaHoc(record);
							setVisibleKhoaHocModal(true);
						}}
					/>
					<Popconfirm
						title='Bạn có chắc chắn muốn xóa khóa học này?'
						onConfirm={() => handleDeleteKhoaHoc(record.id)}
						okText='Có'
						cancelText='Không'
						disabled={record.soLuongHocVien > 0}
					>
						<Button type='primary' danger icon={<DeleteOutlined />} size='small' disabled={record.soLuongHocVien > 0} />
					</Popconfirm>
				</Space>
			),
		},
	];

	// Cấu hình cột cho bảng giảng viên
	const columnsGiangVien = [
		{
			title: 'ID',
			dataIndex: 'id',
			key: 'id',
			width: 100,
		},
		{
			title: 'Tên giảng viên',
			dataIndex: 'tenGiangVien',
			key: 'tenGiangVien',
			sorter: (a: GiangVien, b: GiangVien) => a.tenGiangVien.localeCompare(b.tenGiangVien),
		},
		{
			title: 'Thao tác',
			key: 'action',
			width: 150,
			render: (_: any, record: GiangVien) => {
				// Kiểm tra xem giảng viên có đang dạy khóa học nào không
				const isTeaching = danhSachKhoaHoc.some((kh: KhoaHoc) => kh.giangVien === record.tenGiangVien);

				return (
					<Space>
						<Button
							type='primary'
							icon={<EditOutlined />}
							size='small'
							onClick={() => {
								setEditingGiangVien(record);
								setVisibleGiangVienModal(true);
							}}
						/>
						<Popconfirm
							title='Bạn có chắc chắn muốn xóa giảng viên này?'
							onConfirm={() => handleDeleteGiangVien(record.id)}
							okText='Có'
							cancelText='Không'
							disabled={isTeaching}
						>
							<Button type='primary' danger icon={<DeleteOutlined />} size='small' disabled={isTeaching} />
						</Popconfirm>
					</Space>
				);
			},
		},
	];

	return (
		<PageContainer title='Quản lý khóa học trực tuyến'>
			<Tabs defaultActiveKey='1'>
				<TabPane tab='Quản lý khóa học' key='1'>
					<Card>
						<Row gutter={16} style={{ marginBottom: 16 }}>
							<Col span={7}>
								<Input
									placeholder='Tìm kiếm theo tên khóa học'
									prefix={<SearchOutlined />}
									value={keyword}
									onChange={(e) => setKeyword(e.target.value)}
								/>
							</Col>
							<Col span={5}>
								<Select
									placeholder='Lọc theo giảng viên'
									style={{ width: '100%' }}
									allowClear
									value={giangVienFilter}
									onChange={(value) => setGiangVienFilter(value)}
								>
									{danhSachGiangVien.map((gv: GiangVien) => (
										<Option key={gv.id} value={gv.tenGiangVien}>
											{gv.tenGiangVien}
										</Option>
									))}
								</Select>
							</Col>
							<Col span={5}>
								<Select
									placeholder='Lọc theo trạng thái'
									style={{ width: '100%' }}
									allowClear
									value={trangThai}
									onChange={(value) => setTrangThai(value)}
								>
									{Object.values(TrangThaiKhoaHoc).map((tt) => (
										<Option key={tt} value={tt}>
											{tt}
										</Option>
									))}
								</Select>
							</Col>
							<Col span={7} style={{ textAlign: 'right' }}>
								<Button
									type='primary'
									icon={<PlusOutlined />}
									onClick={() => {
										setEditingKhoaHoc(null);
										setVisibleKhoaHocModal(true);
									}}
									disabled={danhSachGiangVien.length === 0}
								>
									Thêm khóa học
								</Button>
							</Col>
						</Row>

						<Table
							rowKey='id'
							columns={columnsKhoaHoc}
							dataSource={getDanhSachKhoaHocLoc()}
							pagination={{
								defaultPageSize: 10,
								showSizeChanger: true,
								pageSizeOptions: ['10', '20', '50'],
							}}
						/>
					</Card>
				</TabPane>

				<TabPane tab='Quản lý giảng viên' key='2'>
					<Card>
						<Row gutter={16} style={{ marginBottom: 16 }}>
							<Col span={18}>
								<Input
									placeholder='Tìm kiếm theo tên giảng viên'
									prefix={<SearchOutlined />}
									value={keywordGiangVien}
									onChange={(e) => setKeywordGiangVien(e.target.value)}
								/>
							</Col>
							<Col span={6} style={{ textAlign: 'right' }}>
								<Button
									type='primary'
									icon={<PlusOutlined />}
									onClick={() => {
										setEditingGiangVien(null);
										setVisibleGiangVienModal(true);
									}}
								>
									Thêm giảng viên
								</Button>
							</Col>
						</Row>

						<Table
							rowKey='id'
							columns={columnsGiangVien}
							dataSource={getDanhSachGiangVienLoc()}
							pagination={{
								defaultPageSize: 10,
								showSizeChanger: true,
								pageSizeOptions: ['10', '20', '50'],
							}}
						/>
					</Card>
				</TabPane>
			</Tabs>

			{/* Form thêm/sửa khóa học */}
			<KhoaHocForm
				visible={visibleKhoaHocModal}
				onCancel={() => {
					setVisibleKhoaHocModal(false);
					setEditingKhoaHoc(null);
				}}
				onSave={handleSaveKhoaHoc}
				khoaHoc={editingKhoaHoc}
				danhSachGiangVien={danhSachGiangVien}
			/>

			{/* Form thêm/sửa giảng viên */}
			<GiangVienForm
				visible={visibleGiangVienModal}
				onCancel={() => {
					setVisibleGiangVienModal(false);
					setEditingGiangVien(null);
				}}
				onSave={handleSaveGiangVien}
				giangVien={editingGiangVien}
			/>
		</PageContainer>
	);
};

export default KhoaHocPage;
