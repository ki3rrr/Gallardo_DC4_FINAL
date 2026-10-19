import ResourceManager from '../components/ResourceManager';
import { categoriesApi } from '../services/library';

const fields = [
  { name: 'name', label: 'Name', required: true, max: 100 },
  { name: 'description', label: 'Description', as: 'textarea', max: 255 },
];

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'description', header: 'Description' },
  { key: 'books_count', header: 'Books' },
];

export default function Categories() {
  return <ResourceManager title="Categories" singular="Category" api={categoriesApi} fields={fields} columns={columns} />;
}
