import { message } from 'antd';

// Enum cho trạng thái khóa học
export enum TrangThaiKhoaHoc {
	DANG_MO = 'Đang mở',
	DA_KET_THUC = 'Đã kết thúc',
	TAM_DUNG = 'Tạm dừng',
}

// Type cho khóa học
export interface KhoaHoc {
	id: string;
	tenKhoaHoc: string;
	giangVien: string;
	soLuongHocVien: number;
	moTa: string;
	trangThai: TrangThaiKhoaHoc;
}

// Type cho giảng viên
export interface GiangVien {
	id: string;
	tenGiangVien: string;
}

// Type cho model khóa học
export interface KhoaHocModelState {
	danhSachKhoaHoc: KhoaHoc[];
	danhSachGiangVien: GiangVien[];
}

// Type cho model
export interface KhoaHocModelType {
	namespace: 'khoahoc';
	state: KhoaHocModelState;
	effects: {
		fetchKhoaHoc: any;
		fetchGiangVien: any;
		addKhoaHoc: any;
		updateKhoaHoc: any;
		deleteKhoaHoc: any;
		addGiangVien: any;
		updateGiangVien: any;
		deleteGiangVien: any;
	};
	reducers: {
		setDanhSachKhoaHoc: any;
		saveDanhSachKhoaHoc: any;
		setDanhSachGiangVien: any;
		saveDanhSachGiangVien: any;
	};
}

// Model khóa học
const KhoaHocModel: KhoaHocModelType = {
	namespace: 'khoahoc',

	state: {
		danhSachKhoaHoc: [],
		danhSachGiangVien: [],
	},

	effects: {
		*fetchKhoaHoc(_: any, { put }: { put: any }) {
			// Lấy dữ liệu từ localStorage
			const khoaHocData = localStorage.getItem('danhSachKhoaHoc');
			let danhSachKhoaHoc: KhoaHoc[] = [];

			if (khoaHocData) {
				try {
					danhSachKhoaHoc = JSON.parse(khoaHocData);
				} catch (e) {
					console.error('Lỗi khi parse dữ liệu khóa học:', e);
				}
			}

			yield put({
				type: 'setDanhSachKhoaHoc',
				payload: danhSachKhoaHoc,
			});
		},

		*fetchGiangVien(_: any, { put }: { put: any }) {
			// Lấy dữ liệu từ localStorage
			const giangVienData = localStorage.getItem('danhSachGiangVien');
			let danhSachGiangVien: GiangVien[] = [];

			if (giangVienData) {
				try {
					danhSachGiangVien = JSON.parse(giangVienData);
				} catch (e) {
					console.error('Lỗi khi parse dữ liệu giảng viên:', e);
				}
			}

			yield put({
				type: 'setDanhSachGiangVien',
				payload: danhSachGiangVien,
			});
		},

		*addKhoaHoc({ payload }: { payload: any }, { put, select }: { put: any; select: any }) {
			// Lấy danh sách khóa học hiện tại
			const { danhSachKhoaHoc } = yield select((state: any) => state.khoahoc);

			// Kiểm tra tên khóa học đã tồn tại chưa
			const isTenKhoaHocTonTai = danhSachKhoaHoc.some((khoaHoc: KhoaHoc) => khoaHoc.tenKhoaHoc === payload.tenKhoaHoc);

			if (isTenKhoaHocTonTai) {
				message.error('Tên khóa học đã tồn tại!');
				return false;
			}

			// Tạo ID ngẫu nhiên cho khóa học mới
			const newKhoaHoc: KhoaHoc = {
				...payload,
				id: `KH_${Date.now()}`,
			};

			// Thêm khóa học mới vào danh sách
			const newDanhSachKhoaHoc = [...danhSachKhoaHoc, newKhoaHoc];

			// Lưu vào localStorage
			localStorage.setItem('danhSachKhoaHoc', JSON.stringify(newDanhSachKhoaHoc));

			// Cập nhật state
			yield put({
				type: 'saveDanhSachKhoaHoc',
				payload: newDanhSachKhoaHoc,
			});

			message.success('Thêm khóa học thành công!');
			return true;
		},

		*updateKhoaHoc({ payload }: { payload: any }, { put, select }: { put: any; select: any }) {
			// Lấy danh sách khóa học hiện tại
			const { danhSachKhoaHoc } = yield select((state: any) => state.khoahoc);

			// Kiểm tra tên khóa học đã tồn tại chưa (ngoại trừ khóa học đang cập nhật)
			const isTenKhoaHocTonTai = danhSachKhoaHoc.some(
				(khoaHoc: KhoaHoc) => khoaHoc.tenKhoaHoc === payload.tenKhoaHoc && khoaHoc.id !== payload.id,
			);

			if (isTenKhoaHocTonTai) {
				message.error('Tên khóa học đã tồn tại!');
				return false;
			}

			// Cập nhật khóa học
			const newDanhSachKhoaHoc = danhSachKhoaHoc.map((khoaHoc: KhoaHoc) =>
				khoaHoc.id === payload.id ? { ...payload } : khoaHoc,
			);

			// Lưu vào localStorage
			localStorage.setItem('danhSachKhoaHoc', JSON.stringify(newDanhSachKhoaHoc));

			// Cập nhật state
			yield put({
				type: 'saveDanhSachKhoaHoc',
				payload: newDanhSachKhoaHoc,
			});

			message.success('Cập nhật khóa học thành công!');
			return true;
		},

		*deleteKhoaHoc({ payload }: { payload: string }, { put, select }: { put: any; select: any }) {
			// Lấy danh sách khóa học hiện tại
			const { danhSachKhoaHoc } = yield select((state: any) => state.khoahoc);

			// Kiểm tra xem khóa học có học viên không
			const khoaHoc = danhSachKhoaHoc.find((kh: KhoaHoc) => kh.id === payload);
			if (khoaHoc && khoaHoc.soLuongHocVien > 0) {
				message.error('Không thể xóa khóa học đã có học viên!');
				return false;
			}

			// Xóa khóa học
			const newDanhSachKhoaHoc = danhSachKhoaHoc.filter((item: KhoaHoc) => item.id !== payload);

			// Lưu vào localStorage
			localStorage.setItem('danhSachKhoaHoc', JSON.stringify(newDanhSachKhoaHoc));

			// Cập nhật state
			yield put({
				type: 'saveDanhSachKhoaHoc',
				payload: newDanhSachKhoaHoc,
			});

			message.success('Xóa khóa học thành công!');
			return true;
		},

		*addGiangVien({ payload }: { payload: any }, { put, select }: { put: any; select: any }) {
			// Lấy danh sách giảng viên hiện tại
			const { danhSachGiangVien } = yield select((state: any) => state.khoahoc);

			// Kiểm tra tên giảng viên đã tồn tại chưa
			const isTenGiangVienTonTai = danhSachGiangVien.some((gv: GiangVien) => gv.tenGiangVien === payload.tenGiangVien);

			if (isTenGiangVienTonTai) {
				message.error('Tên giảng viên đã tồn tại!');
				return false;
			}

			// Tạo ID ngẫu nhiên cho giảng viên mới
			const newGiangVien: GiangVien = {
				...payload,
				id: `GV_${Date.now()}`,
			};

			// Thêm giảng viên mới vào danh sách
			const newDanhSachGiangVien = [...danhSachGiangVien, newGiangVien];

			// Lưu vào localStorage
			localStorage.setItem('danhSachGiangVien', JSON.stringify(newDanhSachGiangVien));

			// Cập nhật state
			yield put({
				type: 'saveDanhSachGiangVien',
				payload: newDanhSachGiangVien,
			});

			message.success('Thêm giảng viên thành công!');
			return true;
		},

		*updateGiangVien({ payload }: { payload: any }, { put, select }: { put: any; select: any }) {
			// Lấy danh sách giảng viên hiện tại
			const { danhSachGiangVien } = yield select((state: any) => state.khoahoc);

			// Kiểm tra tên giảng viên đã tồn tại chưa (ngoại trừ giảng viên đang cập nhật)
			const isTenGiangVienTonTai = danhSachGiangVien.some(
				(gv: GiangVien) => gv.tenGiangVien === payload.tenGiangVien && gv.id !== payload.id,
			);

			if (isTenGiangVienTonTai) {
				message.error('Tên giảng viên đã tồn tại!');
				return false;
			}

			// Cập nhật giảng viên
			const newDanhSachGiangVien = danhSachGiangVien.map((gv: GiangVien) =>
				gv.id === payload.id ? { ...payload } : gv,
			);

			// Cập nhật tên giảng viên trong khóa học
			const { danhSachKhoaHoc } = yield select((state: any) => state.khoahoc);
			const oldGiangVien = danhSachGiangVien.find((gv: GiangVien) => gv.id === payload.id);

			if (oldGiangVien && oldGiangVien.tenGiangVien !== payload.tenGiangVien) {
				const updatedDanhSachKhoaHoc = danhSachKhoaHoc.map((kh: KhoaHoc) => {
					if (kh.giangVien === oldGiangVien.tenGiangVien) {
						return {
							...kh,
							giangVien: payload.tenGiangVien,
						};
					}
					return kh;
				});

				// Lưu khóa học đã cập nhật
				localStorage.setItem('danhSachKhoaHoc', JSON.stringify(updatedDanhSachKhoaHoc));

				// Cập nhật state khóa học
				yield put({
					type: 'saveDanhSachKhoaHoc',
					payload: updatedDanhSachKhoaHoc,
				});
			}

			// Lưu vào localStorage
			localStorage.setItem('danhSachGiangVien', JSON.stringify(newDanhSachGiangVien));

			// Cập nhật state
			yield put({
				type: 'saveDanhSachGiangVien',
				payload: newDanhSachGiangVien,
			});

			message.success('Cập nhật giảng viên thành công!');
			return true;
		},

		*deleteGiangVien({ payload }: { payload: string }, { put, select }: { put: any; select: any }) {
			// Lấy danh sách giảng viên và khóa học hiện tại
			const { danhSachGiangVien, danhSachKhoaHoc } = yield select((state: any) => state.khoahoc);

			// Kiểm tra xem giảng viên có đang dạy khóa học nào không
			const giangVien = danhSachGiangVien.find((gv: GiangVien) => gv.id === payload);
			if (giangVien) {
				const isGiangVienDangDay = danhSachKhoaHoc.some((kh: KhoaHoc) => kh.giangVien === giangVien.tenGiangVien);
				if (isGiangVienDangDay) {
					message.error('Không thể xóa giảng viên đang dạy khóa học!');
					return false;
				}
			}

			// Xóa giảng viên
			const newDanhSachGiangVien = danhSachGiangVien.filter((gv: GiangVien) => gv.id !== payload);

			// Lưu vào localStorage
			localStorage.setItem('danhSachGiangVien', JSON.stringify(newDanhSachGiangVien));

			// Cập nhật state
			yield put({
				type: 'saveDanhSachGiangVien',
				payload: newDanhSachGiangVien,
			});

			message.success('Xóa giảng viên thành công!');
			return true;
		},
	},

	reducers: {
		setDanhSachKhoaHoc(state: KhoaHocModelState, { payload }: { payload: KhoaHoc[] }) {
			return {
				...state,
				danhSachKhoaHoc: payload,
			};
		},

		saveDanhSachKhoaHoc(state: KhoaHocModelState, { payload }: { payload: KhoaHoc[] }) {
			return {
				...state,
				danhSachKhoaHoc: payload,
			};
		},

		setDanhSachGiangVien(state: KhoaHocModelState, { payload }: { payload: GiangVien[] }) {
			return {
				...state,
				danhSachGiangVien: payload,
			};
		},

		saveDanhSachGiangVien(state: KhoaHocModelState, { payload }: { payload: GiangVien[] }) {
			return {
				...state,
				danhSachGiangVien: payload,
			};
		},
	},
};

export default KhoaHocModel;
