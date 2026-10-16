import Dialog from "../Dialog.jsx";
import MagneticButton from "../effects/MagneticButton.jsx";

export default function CreatePreviewDialog({ open, variants, statusText, onEdit, onConfirm, onClose }) {
  return (
    <Dialog id="createPreviewDialog" className="preview-dialog" open={open} onClose={onClose}>
      <div className="preview-dialog-content">
        <div className="preview-dialog-header">
          <h2>ตรวจสอบกิจกรรมก่อนสร้าง</h2>
          <button id="closeCreatePreviewBtn" type="button" className="secondary" onClick={onClose}>ปิด</button>
        </div>

        <div className="preview-table-wrap">
          <table className="preview-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ชื่อกิจกรรม</th>
                <th>Slug</th>
                <th>Brand ID</th>
                <th>Category ID</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody id="createPreviewTableBody">
              {variants.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <input
                      className="preview-title-input"
                      data-index={index}
                      value={item.title}
                      onChange={e => onEdit(index, "title", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="preview-slug-input"
                      data-index={index}
                      value={item.seoSlugUrl || ""}
                      onChange={e => onEdit(index, "seoSlugUrl", e.target.value)}
                    />
                  </td>
                  <td>{item.brandId || "-"}</td>
                  <td>{item.categories?.[0]?.id || "-"}</td>
                  <td>{statusText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="preview-dialog-actions">
          <button id="cancelCreatePreviewBtn" type="button" className="secondary" onClick={onClose}>
            ย้อนกลับไปแก้ไข
          </button>
          <MagneticButton id="confirmCreatePreviewBtn" type="button" className="primary dark" onClick={onConfirm}>
            ยืนยันสร้างกิจกรรม
          </MagneticButton>
        </div>
      </div>
    </Dialog>
  );
}
