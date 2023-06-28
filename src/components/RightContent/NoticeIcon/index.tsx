import ViewThongBao from '@/pages/ThongBao/components/ViewThongBao';
import { Modal } from 'antd';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import NoticeIcon from './NoticeIcon';

const NoticeIconView = () => {
  const {
    danhSach,
    getThongBaoModel,
    total,
    page,
    limit,
    loading,
    record,
    setRecord,
    unread,
    readNotificationModel,
  } = useModel('thongbao.noticeicon');
  const [visibleDetail, setVisibleDetail] = useState<boolean>(false);
  const [visiblePopup, setVisiblePopup] = useState<boolean>(false);

  useEffect(() => {
    getThongBaoModel();
  }, [page, limit]);

  const clearReadState = async () => {
    readNotificationModel('ALL');
    setVisiblePopup(false);
  };

  return (
    <>
      <NoticeIcon
        count={unread}
        onItemClick={async (item) => {
          setRecord(item);
          setVisibleDetail(true);
          setVisiblePopup(false);
          if (!item.read) readNotificationModel('ONE', item?._id);
        }}
        loading={loading}
        onClear={() => clearReadState()}
        clearText="Đánh dấu tất cả là đã đọc"
        popupVisible={visiblePopup}
        clearClose
        onPopupVisibleChange={(visible) => {
          setVisiblePopup(visible);
        }}
      >
        <NoticeIcon.Tab
          tabKey="notification"
          count={total}
          list={danhSach}
          title="Thông báo"
          emptyText="Bạn đã xem tất cả thông báo"
          showClear={!!unread}
          showViewMore={danhSach.length < total}
        />
      </NoticeIcon>

      <Modal
        width={800}
        bodyStyle={{ padding: 0 }}
        destroyOnClose
        onCancel={() => setVisibleDetail(false)}
        visible={visibleDetail}
        okButtonProps={{ hidden: true }}
        cancelText="Đóng"
      >
        <ViewThongBao
          record={record}
          afterViewDetail={() => {
            setVisibleDetail(false);
            setVisiblePopup(false);
          }}
        />
      </Modal>
    </>
  );
};

export default NoticeIconView;
