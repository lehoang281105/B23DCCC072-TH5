import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, Space, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  skills: string;
  club: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

interface Club {
  id: string;
  name: string;
}

const ClubMembers: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetClub, setTargetClub] = useState<string | null>(null);
  const [selectedClub, setSelectedClub] = useState<string | null>(null); // Lưu câu lạc bộ được chọn
  const [form] = Form.useForm();
  const [refresh, setRefresh] = useState(false); // Trạng thái để làm mới dữ liệu
  const [editingClub, setEditingClub] = useState<Club | null>(null); // Trạng thái để chỉnh sửa CLB

  const fetchMembers = () => {
    fetch('https://67f74a7a42d6c71cca64966c.mockapi.io/students')
      .then((res) => res.json())
      .then((data) => {
        const updatedMembers = data.map((member: Member) => {
          const club = clubs.find((c) => c.id === member.club); // Tìm tên câu lạc bộ dựa trên ID
          return { ...member, club: club ? club.name : 'Không xác định' }; // Gán tên câu lạc bộ
        });
        setMembers(updatedMembers);
      })
      .catch((err) => console.error('Error fetching members:', err));
  };

  const fetchClubs = () => {
    fetch('https://67f72b6542d6c71cca643b99.mockapi.io/Clb')
      .then((res) => res.json())
      .then((data) => setClubs(data))
      .catch((err) => console.error('Error fetching clubs:', err));
  };

  useEffect(() => {
    fetchMembers();
    fetchClubs();
  }, [refresh]); // Lắng nghe trạng thái refresh

  const handleChangeClub = () => {
    if (!targetClub) {
      message.error('Vui lòng chọn câu lạc bộ để chuyển!');
      return;
    }

    const selectedClubName = clubs.find((club) => club.id === targetClub)?.name || 'Không xác định';

    Promise.all(
      selectedMembers.map((id) =>
        fetch(`https://67f74a7a42d6c71cca64966c.mockapi.io/students/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ club: targetClub }),
        })
      )
    )
      .then(() => {
        message.success('Chuyển câu lạc bộ thành công!');
        setMembers((prev) =>
          prev.map((member) =>
            selectedMembers.includes(member.id) ? { ...member, club: selectedClubName } : member
          )
        );
        setRefresh((prev) => !prev); // Làm mới dữ liệu
        setSelectedMembers([]); // Xóa các hàng đã chọn
        setIsModalOpen(false); // Đóng modal
      })
      .catch((err) => console.error('Error changing club:', err));
  };

  const handleSave = async (values: any) => {
    try {
      if (editingClub) {
        // Chỉnh sửa CLB
        const response = await fetch(`https://67f72b6542d6c71cca643b99.mockapi.io/Clb/${editingClub.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        await response.json();
      } else {
        // Thêm CLB mới
        const response = await fetch('https://67f72b6542d6c71cca643b99.mockapi.io/Clb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        await response.json();
      }
      setRefresh((prev) => !prev); // Làm mới dữ liệu
      form.resetFields();
      setEditingClub(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving club:', error);
    }
  };

  const openChangeClubModal = (memberIds: string[]) => {
    setSelectedMembers(memberIds);
    setIsModalOpen(true);
  };

  const filteredMembers = selectedClub
    ? members.filter((member) => member.club === selectedClub)
    : members;

  const columns = [
    { title: 'Họ tên', dataIndex: 'name', sorter: (a: Member, b: Member) => a.name.localeCompare(b.name) },
    { title: 'Email', dataIndex: 'email' },
    { title: 'SĐT', dataIndex: 'phone' },
    { title: 'Giới tính', dataIndex: 'gender' },
    { title: 'Địa chỉ', dataIndex: 'address' },
    { title: 'Sở trường', dataIndex: 'skills' },
    { title: 'Câu lạc bộ', dataIndex: 'club' }, // Hiển thị tên câu lạc bộ
    {
      title: 'Thao tác',
      render: (_: any, record: Member) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openChangeClubModal([record.id])}>
            Đổi CLB
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Select
        placeholder="Chọn câu lạc bộ"
        style={{ width: 200, marginBottom: 16 }}
        onChange={(value) => setSelectedClub(value)}
        allowClear
      >
        <Select.Option value={null}>Tất cả</Select.Option>
        {clubs.map((club) => (
          <Select.Option key={club.id} value={club.name}>
            {club.name}
          </Select.Option>
        ))}
      </Select>
      <Button
        type="primary"
        onClick={() => openChangeClubModal(selectedMembers)}
        disabled={!selectedMembers.length}
        style={{ marginBottom: 16, marginLeft: 16 }}
      >
        Đổi CLB cho {selectedMembers.length} thành viên đã chọn
      </Button>
      <Table
        rowKey="id"
        dataSource={filteredMembers} // Sử dụng danh sách đã lọc
        columns={columns}
        rowSelection={{
          selectedRowKeys: selectedMembers,
          onChange: (selectedRowKeys: React.Key[]) => setSelectedMembers(selectedRowKeys as string[]),
        }}
      />
      <Modal
        title={`Đổi câu lạc bộ cho ${selectedMembers.length} thành viên`}
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleChangeClub}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Chọn câu lạc bộ" required>
            <Select
              placeholder="Chọn câu lạc bộ"
              onChange={(value) => setTargetClub(value)}
              options={clubs.map((club) => ({ value: club.id, label: club.name }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClubMembers;