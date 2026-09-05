import React from 'react';
import { Modal } from './Modal.jsx';
import { Button } from '../Button/Button.jsx';
import { Icon } from '../Icon/Icon.jsx';

export function ConfirmModal({
  open = true, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  destructive = true, loading = false, onConfirm, onClose, children
}) {
  return (
    <Modal open={open} title={title} description={description} onClose={onClose}
      tone={destructive ? 'danger' : 'accent'}
      mark={<Icon name={destructive ? 'alert' : 'info'} size={16} />}
      footer={<>
        <Button variant="secondary" onClick={onClose}>{cancelLabel}</Button>
        <Button variant={destructive ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </>}>
      {children}
    </Modal>
  );
}
