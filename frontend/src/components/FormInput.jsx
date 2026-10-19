/**
 * Controlled form field with label + error text shown under the field.
 * as: 'input' (default) | 'textarea' | 'select'   (for select pass <option> children)
 */
export default function FormInput({ label, name, error, as = 'input', children, ...props }) {
  const Tag = as;
  const id = `field-${name}`;
  return (
    <div className={`field ${error ? 'field-invalid' : ''}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <Tag id={id} name={name} {...props}>
        {children}
      </Tag>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
