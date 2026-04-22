INSERT INTO users (id, name, email, role, password, created_at, updated_at) VALUES 
('1', 'Admin Staff', 'admin@example.com', 'ADMIN', 'pw', NOW(), NOW()),
('2', 'Student User', 'student@example.com', 'USER', 'pw', NOW(), NOW()),
('3', 'Jane Tech', 'tech@example.com', 'TECHNICIAN', 'pw', NOW(), NOW()) ON CONFLICT DO NOTHING;

INSERT INTO resources (id, name, type, location, capacity, status, created_at, updated_at) VALUES 
('1', 'LH-301 (Lecture Hall)', 'LECTURE_HALL', 'Building A', 50, 'ACTIVE', NOW(), NOW()),
('2', 'IT Lab 01', 'LAB', 'Building B', 30, 'ACTIVE', NOW(), NOW()),
('3', 'Meeting Room C', 'MEETING_ROOM', 'Level 2', 10, 'ACTIVE', NOW(), NOW()),
('4', 'Projector #5', 'EQUIPMENT', 'Store Room', 1, 'ACTIVE', NOW(), NOW()) ON CONFLICT DO NOTHING;
