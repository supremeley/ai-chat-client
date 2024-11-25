import type {
  BaseRangePickerProps,
  ButtonProps,
  CascaderProps,
  CheckboxGroupProps,
  DatePickerProps,
  FormItemProps,
  FormProps,
  InputNumberProps,
  InputProps,
  RadioGroupProps,
  SelectProps,
  SwitchProps,
  TextAreaProps,
  TreeSelectProps,
  UploadProps,
} from '@arco-design/web-react';
import type { GridRowGutter } from '@arco-design/web-react/es/Grid/interface';
import type { InputPasswordProps } from '@arco-design/web-react/es/Input';

interface FormGroupProps extends FormItemConfig {
  childrenItems: FormItemConfig[];
}

interface ComponentProps {
  input: InputProps;
  password: InputPasswordProps;
  inputNumber: InputNumberProps;
  textarea: TextAreaProps;
  switch: SwitchProps;
  radio: RadioGroupProps;
  checkbox: CheckboxGroupProps<string | number>;
  datePicker: DatePickerProps;
  rangePicker: BaseRangePickerProps;
  uploadPhoto: UploadProps;
  group: FormGroupProps;
  select: SelectProps;
  cascader: CascaderProps;
  treeSelect: TreeSelectProps;
  custom: object;
}

export interface FormItemConfig extends FormItemProps {
  formItemProps: FormItemProps;
  component: keyof ComponentProps;
  componentProps?: ComponentProps[keyof ComponentProps];
  customRender?: () => React.ReactElement;
  watch?: WatchConfig;
  hidden?: () => boolean;
  span?: number;
}
// TODO:
//     | 'timepicker'
//     | 'slider'
//     | 'rate'
//     | 'cascader'
//     | 'treeSelect'
//     | 'transfer'
//     | 'textarea';
//   span?: number;
// });

export type FormButtonConfig = ButtonProps & {
  name: string;
};

export interface WatchConfig {
  field: string;
  depend: string;
  condition: (p: unknown) => boolean;
}

export interface FormLayoutConfig {
  baseCol?: number;
  gutter?: GridRowGutter | GridRowGutter[];
}

export interface FormConfig extends FormProps {
  layoutConfig?: FormLayoutConfig;
  formItems: FormItemConfig[];
  formButtons?: FormButtonConfig[];
}
