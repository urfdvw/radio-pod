import './ConfirmDialog.css';

export default function ConfirmDialog({ message, selectedOption, onConfirm, onCancel }) {
  return (
    <div className="confirm-dialog">
      <div className="confirm-dialog__message">{message}</div>
      <div className="confirm-dialog__options">
        <div
          className={`confirm-dialog__option ${selectedOption === 0 ? 'confirm-dialog__option--selected' : ''}`}
          onClick={onCancel}
        >
          Cancel
        </div>
        <div
          className={`confirm-dialog__option ${selectedOption === 1 ? 'confirm-dialog__option--selected' : ''}`}
          onClick={onConfirm}
        >
          Delete
        </div>
      </div>
    </div>
  );
}
