const DATABASE_NAME = 'cndpaper-web-clipper';
const STORE_NAME = 'app-data';
const DIRECTORY_HANDLE_KEY = 'directory-handle';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('无法打开本地设置数据库'));
  });
}

export async function getDirectoryHandle(): Promise<FileSystemDirectoryHandle | undefined> {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database
        .transaction(STORE_NAME, 'readonly')
        .objectStore(STORE_NAME)
        .get(DIRECTORY_HANDLE_KEY);
      request.onsuccess = () => resolve(request.result as FileSystemDirectoryHandle | undefined);
      request.onerror = () => reject(request.error ?? new Error('无法读取保存目录'));
    });
  } finally {
    database.close();
  }
}

export async function setDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(handle, DIRECTORY_HANDLE_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('无法保存目录设置'));
    });
  } finally {
    database.close();
  }
}
