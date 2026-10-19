import ResourceManager from '../components/ResourceManager';
import { authorsApi } from '../services/library';

const fields = [
  { name: 'name', label: 'Name', required: true, max: 255 },
  { name: 'nationality', label: 'Nationality', max: 80 },
  { name: 'bio', label: 'Biography', as: 'textarea', max: 3000 },
];

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'nationality', header: 'Nationality' },
  { key: 'books_count', header: 'Books' },
];

export default function Authors() {
  return <ResourceManager title="Authors" singular="Author" api={authorsApi} fields={fields} columns={columns} />;
}
