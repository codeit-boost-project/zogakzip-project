import express from 'express';
import { 
  registerGroup, 
  editGroup, 
  deleteGroup, 
  viewGroupList, 
  viewGroupDetails, 
  checkGroupPermissions,
  likeGroup,
  checkGroupVisibility,
} from '../controllers/groupController.js';

const router = express.Router();


/* 그룹 */

router.post('/', registerGroup); // 그룹 등록 -> 완료
router.get('/', viewGroupList); // 그룹 목록 조회 -> 완료
router.put('/:groupId', editGroup); // 그룹 수정 -> 완료
router.delete('/:groupId', deleteGroup); // 그룹 삭제 -> 완료
router.get('/:groupId', viewGroupDetails); // 그룹 상세 정보 조회 -> 완료
router.post('/:groupId/verify-password', checkGroupPermissions) // 그룹 조회 권한 확인 -> 완료
router.post('/:groupId/like', likeGroup) // 그룹 공감 하기 -> 완료
router.get('/:groupId/is-public', checkGroupVisibility) // 그룹 공개 여부 확인 -> 완료


export default router;