import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/offline_attendance_record.dart';

class OfflineDatabaseService {
  static final OfflineDatabaseService instance = OfflineDatabaseService._init();
  static Database? _database;

  OfflineDatabaseService._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('kiosk_attendance.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE offline_attendances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_uid TEXT,
        qr_payload TEXT,
        method TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        device_id TEXT NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0
      )
    ''');
  }

  Future<int> insertAttendance(OfflineAttendanceRecord record) async {
    final db = await instance.database;
    return await db.insert('offline_attendances', record.toMap());
  }

  Future<List<OfflineAttendanceRecord>> getUnsyncedRecords() async {
    final db = await instance.database;
    final result = await db.query(
      'offline_attendances',
      where: 'is_synced = ?',
      whereArgs: [0],
      orderBy: 'id ASC',
    );

    return result.map((json) => OfflineAttendanceRecord.fromMap(json)).toList();
  }

  Future<int> markAsSynced(List<int> ids) async {
    if (ids.isEmpty) return 0;
    final db = await instance.database;
    final placeholders = List.filled(ids.length, '?').join(',');

    return await db.rawUpdate(
      'UPDATE offline_attendances SET is_synced = 1 WHERE id IN ($placeholders)',
      ids,
    );
  }

  Future<int> getUnsyncedCount() async {
    final db = await instance.database;
    final result = await db.rawQuery(
      'SELECT COUNT(*) as count FROM offline_attendances WHERE is_synced = 0',
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }
}

