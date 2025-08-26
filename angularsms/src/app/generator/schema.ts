export interface Schema {
  collections: Collection[];
  relations?: Relation[];
}

export interface Collection {
  id: string;
  name: string;
  fields: Field[];
}

export interface Field {
  name: string;
  type: 'String' | 'Number' | 'Boolean' | string;
  validation?: {
    required?: { value: boolean; message?: string };
    min?: { value: number; message?: string };
    max?: { value: number; message?: string };
    minLength?: { value: number; message?: string };
    maxLength?: { value: number; message?: string };
    pattern?: { value: string; message?: string };
  };
  form?: {
    input?: 'text' | 'number' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'textarea';
    options?: string[];
    grid?: number; // 1..12
    placeholder?: string;
  };
}

export interface Relation {
  relationType: 'one-to-many' | 'many-to-one' | 'many-to-many';
  from: string; // collection id
  to: string;   // collection id
  label?: string;
  fromField?: string;
  toField?: string;
}
