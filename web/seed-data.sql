-- Beispieldaten für Nervesgun Gallery
-- Zuerst einen Test-User erstellen
INSERT INTO User (id, name, email, role, createdAt, updatedAt) 
VALUES ('user1', 'Test User', 'test@thegoodwins.de', 'USER', datetime('now'), datetime('now'));

-- 5 Beispiel-Ärgernisse einfügen
INSERT INTO Report (id, text, url, title, status, authorId, createdAt, updatedAt) VALUES
('report1', 'Login-Button muss doppelt geklickt werden, sonst passiert nichts. Sehr nervig beim täglichen Arbeiten!', 'https://company-tool.example.com/login', 'Company Tool - Login', 'OPEN', 'user1', datetime('now', '-4 hours'), datetime('now', '-4 hours')),

('report2', 'Das Dropdown-Menü schließt sich sofort wieder, wenn man versucht eine Option auszuwählen. Unmöglich zu bedienen!', 'https://dashboard.company.com/settings', 'Dashboard Settings', 'OPEN', 'user1', datetime('now', '-3 hours'), datetime('now', '-3 hours')),

('report3', 'Formular-Validierung zeigt Fehler erst nach dem Absenden an. Warum nicht während der Eingabe?', 'https://forms.company.com/contact', 'Contact Form', 'TRIAGED', 'user1', datetime('now', '-2 hours'), datetime('now', '-2 hours')),

('report4', 'Ladezeiten sind extrem lang. Manchmal dauert es 30+ Sekunden bis eine Seite lädt. Unproduktiv!', 'https://reports.company.com/analytics', 'Analytics Dashboard', 'OPEN', 'user1', datetime('now', '-1 hour'), datetime('now', '-1 hour')),

('report5', 'Mobile Ansicht ist komplett kaputt. Buttons sind zu klein und überlappen sich. Unbenutzbar auf dem Handy.', 'https://mobile.company.com/tasks', 'Task Management Mobile', 'RESOLVED', 'user1', datetime('now', '-30 minutes'), datetime('now', '-30 minutes'));

-- Einige Upvotes hinzufügen
INSERT INTO Upvote (userId, reportId, createdAt) VALUES
('user1', 'report1', datetime('now', '-3 hours')),
('user1', 'report2', datetime('now', '-2 hours')),
('user1', 'report4', datetime('now', '-1 hour'));

-- Einige Kommentare hinzufügen
INSERT INTO Comment (id, text, authorId, reportId, createdAt) VALUES
('comment1', 'Kann ich bestätigen! Passiert mir auch ständig. Sehr frustrierend.', 'user1', 'report1', datetime('now', '-3 hours')),
('comment2', 'Das ist ein bekanntes Problem. Wir arbeiten daran.', 'user1', 'report1', datetime('now', '-2 hours')),
('comment3', 'Mobile Version ist wirklich schlimm. Hoffe das wird bald gefixt!', 'user1', 'report5', datetime('now', '-20 minutes'));