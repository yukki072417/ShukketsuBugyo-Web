import { Button, Container, Table, Alert, Modal, Form } from "react-bootstrap";
import {
  createPeriods,
  getPeriods,
  updatePeriod,
  deletePeriod
} from "../../../../shared/";
import { useEffect, useState, useRef } from "react";
import { type PeriodTimes } from "../../../../shared/utils/type";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

const EditModal = ({
  show,
  onHide,
  mode,
  editingPeriod,
  onSave,
}: {
  show: boolean;
  onHide: () => void;
  mode: "create" | "edit";
  editingPeriod: PeriodTimes | null;
  onSave: (data: PeriodTimes) => void;
}) => {
  const { t } = useTranslation('periodSettings');
  const periodRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (show && editingPeriod && mode === "edit") {
      if (periodRef.current) periodRef.current.value = editingPeriod.period;
      if (startTimeRef.current)
        startTimeRef.current.value = editingPeriod.start_time;
      if (endTimeRef.current) endTimeRef.current.value = editingPeriod.end_time;
    } else if (show && mode === "create") {
      if (periodRef.current) periodRef.current.value = "";
      if (startTimeRef.current) startTimeRef.current.value = "";
      if (endTimeRef.current) endTimeRef.current.value = "";
    }
  }, [show, editingPeriod, mode]);

  const handleSave = () => {
    const period = periodRef.current?.value || "";
    const start_time = startTimeRef.current?.value || "";
    const end_time = endTimeRef.current?.value || "";

    if (!period || !start_time || !end_time) {
      alert(t('validation_error'));
      return;
    }

    onSave({ period, start_time, end_time });
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === "create" ? t('modal_title_create') : t('modal_title_edit')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{t('period')}</Form.Label>
            <Form.Control type="text" ref={periodRef} placeholder={t('period_placeholder')} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('start_time')}</Form.Label>
            <Form.Control type="time" ref={startTimeRef} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('end_time')}</Form.Label>
            <Form.Control type="time" ref={endTimeRef} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t('cancel')}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t('save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const Periods = ({
  timeSlots,
  onEdit,
  onDelete,
}: {
  timeSlots: (PeriodTimes | null)[];
  onEdit: (mode: "edit", period: PeriodTimes) => void;
  onDelete: (period: string) => void;
}) => {
  const { t } = useTranslation('periodSettings');
  if (!timeSlots || !Array.isArray(timeSlots)) return <></>;  
  
  const formatTime = (time: string) => {
    if (i18next.language === "en") {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${ampm} ${displayHour}:${minutes}`;
    }
    return time;
  };
  return (
    <Table style={{ marginTop: "30px" }} striped bordered hover responsive>
      <thead>
        <tr>
          <th>{t('period')}</th>
          <th>{t('start_time')}</th>
          <th>{t('end_time')}</th>
          <th>{t('actions')}</th>
        </tr>
      </thead>
      <tbody>
        {timeSlots
          .filter((slot): slot is PeriodTimes => slot !== null)
          .map((timeSlot, index) => (
            <tr key={index}>
              <td>
                {timeSlot.period}
                {Number.isInteger(Number(timeSlot.period)) ? (t('period') === 'Period' ? '' : '時間目') : ""}
              </td>

              <td>{formatTime(timeSlot.start_time)}</td>
              <td>{formatTime(timeSlot.end_time)}</td>
              <td>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit("edit", timeSlot)}
                  className="me-2"
                >
                  {t('edit')}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(timeSlot.period)}
                >
                  {t('delete')}
                </Button>
              </td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
};

const PeriodSettings = () => {
  const { t } = useTranslation('periodSettings');
  const [timeSlots, setTimeSlots] = useState<(PeriodTimes | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingPeriod, setEditingPeriod] = useState<PeriodTimes | null>(null);

  const fetchTimeSlots = async () => {
    try {
      const response = await getPeriods();
      // APIが配列を直接返すことを想定
      if (Array.isArray(response.data)) {
        // hh:mm:ssからhh:mmに変換して表示
        const formattedTimeSlots = response.data.map((slot: any) => ({
          ...slot,
          start_time: slot.start_time?.substring(0, 5) || slot.start_time,
          end_time: slot.end_time?.substring(0, 5) || slot.end_time,
        }));
        setTimeSlots(formattedTimeSlots);
      } else {
        setTimeSlots([]);
      }
    } catch (err) {
      setError(t('fetch_error'));
      console.error(err);
      setTimeSlots([]);
    }
  };

  const handleShowModal = (
    mode: "create" | "edit",
    period: PeriodTimes | null = null
  ) => {
    setModalMode(mode);
    setEditingPeriod(period);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSave = async (data: PeriodTimes) => {
    try {
      if (modalMode === "create") {
        // 新規作成時は単一のアイテムを送信
        await createPeriods([data]);
      } else if (editingPeriod) {
        console.log(data)
        await updatePeriod(editingPeriod.period, {
          period: data.period,
          start_time: data.start_time,
          end_time: data.end_time,
        });
      }
      alert(modalMode === "create" ? t('create_success') : t('update_success'));
      setShowModal(false);
      fetchTimeSlots();
    } catch (err) {
      setError(modalMode === "create" ? t('create_failed') : t('update_failed'));
      console.error(err);
    }
  };

  const handleDelete = async (period: string) => {
    if (window.confirm(t('delete_confirm'))) {
      try {
        await deletePeriod(period);
        alert(t('delete_success'));
        fetchTimeSlots();
      } catch (err) {
        setError(t('delete_failed'));
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  return (
    <Container className="common">
      <h3>{t('title')}</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button onClick={() => handleShowModal("create")}>{t('create_new')}</Button>
      <Periods
        timeSlots={timeSlots}
        onEdit={handleShowModal}
        onDelete={handleDelete}
      />
      <EditModal
        show={showModal}
        onHide={handleCloseModal}
        mode={modalMode}
        editingPeriod={editingPeriod}
        onSave={handleSave}
      />
    </Container>
  );
};

export default PeriodSettings;
