import React from 'react';
import { Modal, Button, ButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface ExportModalProps {
  show: boolean;
  onHide: () => void;
  onExport: (type: 'csv' | 'excel' | 'print') => void;
  title: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ show, onHide, onExport, title }) => {
  const { t } = useTranslation('lessonStats');

  const handleExport = (type: 'csv' | 'excel' | 'print') => {
    onExport(type);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('export_data')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p className="mb-4">{title}</p>
        <ButtonGroup vertical className="w-100">
          <Button variant="success" onClick={() => handleExport('csv')} className="mb-2">
            <span className="material-icons me-2">download</span>
            CSV
          </Button>
          <Button variant="success" onClick={() => handleExport('excel')} className="mb-2">
            <span className="material-icons me-2">table_chart</span>
            Excel
          </Button>

          <Button variant="primary" onClick={() => handleExport('print')}>
            <span className="material-icons me-2">print</span>
            {t('print')}
          </Button>
        </ButtonGroup>
      </Modal.Body>
    </Modal>
  );
};

export default ExportModal;