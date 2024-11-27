import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Button, Form, Input, DatePicker, Table, message, Tooltip, Modal } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FileExcelOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import moment from 'moment';

const { Header, Content } = Layout;

const EventApp = () => {
  const [events, setEvents] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: null,
    availablePlaces: 0,
    totalPlaces: 0,
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [newReservation, setNewReservation] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [editingReservation, setEditingReservation] = useState(null); // Para editar reservas existentes
  const [pendingReservations, setPendingReservations] = useState([]); // Reservas pendientes

  // Simulación de datos de eventos (sin los ejemplos eliminados)
  useEffect(() => {
    const mockEvents = [
      // Aquí puedes añadir tus eventos manualmente o usar datos de API
    ];
    setEvents(mockEvents);
  }, []);

  // Genera archivo Excel de eventos y reservas
const generateEventsExcel = () => {
  // Combina los eventos con sus respectivas reservas
  const eventsWithReservations = events.map(event => {
    // Filtra las reservas para el evento actual
    const eventReservations = reservations.filter(reservation => reservation.eventId === event.id);
    // Añade las reservas al objeto del evento
    return {
      ...event,
      reservations: eventReservations.map(reservation => ({
        firstName: reservation.firstName,
        lastName: reservation.lastName,
        phone: reservation.phone,
        email: reservation.email,
        status: reservation.status,
      })),
    };
  });

  // Convierte los datos a formato de hoja de cálculo (incluyendo reservas)
  const eventSheets = eventsWithReservations.map(event => {
    // Combina la información del evento con las reservas en un solo array de objetos
    const eventData = event.reservations.map(reservation => ({
      ...event,  // Incluye los datos del evento
      ...reservation,  // Incluye los datos de la reserva
    }));
    return eventData;
  });

  // Aplanar los datos de eventos y reservas en una sola lista
  const allEventData = eventSheets.flat();

  // Crea la hoja de cálculo
  const ws = XLSX.utils.json_to_sheet(allEventData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Eventos con Reservas');
  XLSX.writeFile(wb, 'Eventos_con_Reservas.xlsx');
  message.success('Archivo Excel generado exitosamente con eventos y reservas');
};

  // Crear nuevo evento
  const createEvent = (values) => {
    const newEventData = { 
      ...values, 
      id: events.length + 1,
      date: values.date ? values.date.format('YYYY-MM-DD') : null,
      totalPlaces: values.availablePlaces, // Establecer totalPlaces
    };
    setEvents([...events, newEventData]);
    message.success('Evento creado exitosamente');
  };

  // Eliminar evento
  const deleteEvent = (record) => {
    setEvents(events.filter(event => event.id !== record.id));
    message.success('Evento eliminado exitosamente');
  };

  // Seleccionar evento y cargar reservas
  const setSelectedEventHandler = (event) => {
    setSelectedEvent(event);
    setReservations([]); // Limpiar reservas al seleccionar un nuevo evento
  };

  // Agregar reserva
  const addReservation = () => {
    if (!newReservation.firstName || !newReservation.lastName || !newReservation.phone || !newReservation.email) {
      message.error('Por favor ingresa todos los campos');
      return;
    }

    // Al guardar una reserva sin confirmación, la guardamos como pendiente
    const updatedReservations = [
      ...reservations,
      { 
        ...newReservation, 
        id: reservations.length + 1, 
        status: 'pendiente' 
      }
    ];

    setReservations(updatedReservations);

    // Agregar reserva a la lista de pendientes
    setPendingReservations(updatedReservations);

    // Limpiar campos del formulario de reserva
    setNewReservation({ firstName: '', lastName: '', phone: '', email: '' });
    message.success('Reserva agregada exitosamente');
  };

  // Confirmar reserva
  const confirmReservation = (reservationId) => {
    const updatedReservations = reservations.map(reservation =>
      reservation.id === reservationId
        ? { ...reservation, status: 'confirmado' }
        : reservation
    );
    setReservations(updatedReservations);
    message.success('Reserva confirmada');
  };

  // Editar evento
  const editEvent = (record) => {
    setEditingEvent(record);
    setNewEvent({
      name: record.name,
      description: record.description,
      date: moment(record.date),
      availablePlaces: record.availablePlaces,
      totalPlaces: record.totalPlaces,
    });
  };

  // Guardar evento editado
  const saveEditedEvent = (values) => {
    const updatedEvents = events.map(event =>
      event.id === editingEvent.id
        ? { ...event, ...values, date: values.date.format('YYYY-MM-DD') }
        : event
    );
    setEvents(updatedEvents);
    message.success('Evento actualizado exitosamente');
    setEditingEvent(null); // Cerrar el formulario de edición
  };

  // Editar reserva
  const editReservation = (reservation) => {
    setEditingReservation(reservation);
    setNewReservation({
      firstName: reservation.firstName,
      lastName: reservation.lastName,
      phone: reservation.phone,
      email: reservation.email,
    });
  };

  // Guardar reserva editada
  const saveEditedReservation = () => {
    if (!newReservation.firstName || !newReservation.lastName || !newReservation.phone || !newReservation.email) {
      message.error('Por favor ingresa todos los campos');
      return;
    }

    const updatedReservations = reservations.map(reservation =>
      reservation.id === editingReservation.id
        ? { ...reservation, ...newReservation }
        : reservation
    );

    setReservations(updatedReservations);
    setEditingReservation(null);
    message.success('Reserva actualizada exitosamente');
  };

  // Eliminar reserva
  const deleteReservation = (reservationId) => {
    const updatedReservations = reservations.filter(reservation => reservation.id !== reservationId);
    setReservations(updatedReservations);
    message.success('Reserva eliminada exitosamente');
  };

  // Columnas de la tabla de eventos
  const eventColumns = [
    { 
      title: 'Nombre', 
      dataIndex: 'name', 
      key: 'name',
      className: 'event-column' 
    },
    { 
      title: 'Descripción', 
      dataIndex: 'description', 
      key: 'description',
      className: 'event-column' 
    },
    { 
      title: 'Fecha', 
      dataIndex: 'date', 
      key: 'date',
      className: 'event-column' 
    },
    { 
      title: 'Cupo Total', 
      dataIndex: 'totalPlaces', 
      key: 'totalPlaces',
      className: 'event-column' 
    },
    { 
      title: 'Cupo Disponible', 
      dataIndex: 'availablePlaces', 
      key: 'availablePlaces',
      className: 'event-column' 
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <div className="action-buttons">
          <Tooltip title="Editar">
            <Button 
              icon={<EditOutlined />} 
              className="btn-edit pulse-animation"
              onClick={() => editEvent(record)} // Editar evento
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button 
              icon={<DeleteOutlined />} 
              className="btn-delete shake-animation"
              onClick={() => deleteEvent(record)}
            />
          </Tooltip>
          <Tooltip title="Ver Reservas">
            <Button 
              icon={<CheckCircleOutlined />} 
              className="btn-view hover-grow"
              onClick={() => setSelectedEventHandler(record)} // Ver reservas
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // Columnas de la tabla de reservas
  const reservationColumns = [
    { title: 'Nombre', dataIndex: 'firstName', key: 'firstName' },
    { title: 'Apellido', dataIndex: 'lastName', key: 'lastName' },
    { title: 'Teléfono', dataIndex: 'phone', key: 'phone' },
    { title: 'Correo', dataIndex: 'email', key: 'email' },
    { title: 'Estado', dataIndex: 'status', key: 'status' },
    { 
      title: 'Acciones', 
      key: 'actions',
      render: (_, record) => (
        <div className="action-buttons">
          <Tooltip title="Editar">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => editReservation(record)} // Editar reserva
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button 
              icon={<DeleteOutlined />} 
              onClick={() => deleteReservation(record.id)} // Eliminar reserva
            />
          </Tooltip>
          <Tooltip title="Confirmar Reserva">
            <Button 
              icon={<CheckCircleOutlined />} 
              onClick={() => confirmReservation(record.id)} // Confirmar reserva
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Layout className="event-layout">
      <Content>
        {/* Tabla de Eventos */}
        <Card title="Eventos" extra={<Button type="primary" onClick={generateEventsExcel} icon={<FileExcelOutlined />}>Generar Excel</Button>}>
          <Table
            dataSource={events}
            columns={eventColumns}
            rowKey="id"
            pagination={false}
            className="event-table"
          />
        </Card>

        {/* Formulario de Creación de Evento */}
        <Card title="Crear Evento">
          <Form layout="vertical" onFinish={createEvent}>
            <Form.Item
              label="Nombre del Evento"
              name="name"
              rules={[{ required: true, message: 'Por favor ingresa el nombre del evento' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Descripción"
              name="description"
              rules={[{ required: true, message: 'Por favor ingresa la descripción del evento' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Fecha"
              name="date"
              rules={[{ required: true, message: 'Por favor ingresa la fecha del evento' }]}
            >
              <DatePicker />
            </Form.Item>

            <Form.Item
              label="Cupos Disponibles"
              name="availablePlaces"
              rules={[{ required: true, message: 'Por favor ingresa los cupos disponibles' }]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Crear Evento
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Modal de Ver Reservas */}
        <Modal
          title="Ver Reservas"
          visible={!!selectedEvent}
          onCancel={() => setSelectedEvent(null)}
          footer={null}
          destroyOnClose
          width={800}
          style={{ top: 20 }}
          draggable
        >
          <h3>Reserva Evento: {selectedEvent?.name}</h3>
          <Form layout="vertical" onFinish={addReservation}>
            <Form.Item
              label="Nombre"
              name="firstName"
              rules={[{ required: true, message: 'Por favor ingresa el nombre del cliente' }]}
            >
              <Input
                value={newReservation.firstName}
                onChange={(e) => setNewReservation({ ...newReservation, firstName: e.target.value })}
              />
            </Form.Item>

            <Form.Item
              label="Apellido"
              name="lastName"
              rules={[{ required: true, message: 'Por favor ingresa el apellido del cliente' }]}
            >
              <Input
                value={newReservation.lastName}
                onChange={(e) => setNewReservation({ ...newReservation, lastName: e.target.value })}
              />
            </Form.Item>

            <Form.Item
              label="Teléfono"
              name="phone"
              rules={[{ required: true, message: 'Por favor ingresa el teléfono del cliente' }]}
            >
              <Input
                value={newReservation.phone}
                onChange={(e) => setNewReservation({ ...newReservation, phone: e.target.value })}
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Por favor ingresa el correo electrónico del cliente' }]}
            >
              <Input
                value={newReservation.email}
                onChange={(e) => setNewReservation({ ...newReservation, email: e.target.value })}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Aceptar
              </Button>
            </Form.Item>
          </Form>

          {/* Tabla de Reservas */}
          <Table
            dataSource={reservations}
            columns={reservationColumns}
            rowClassName="reservation-row"
            pagination={false}
          />

          {/* Botón Confirmar */}
          <Button 
            type="primary" 
            onClick={() => setSelectedEvent(null)} 
            style={{ marginTop: 20 }}
          >
            Confirmar
          </Button>
        </Modal>
      </Content>
    </Layout>
  );
};

export default EventApp;
