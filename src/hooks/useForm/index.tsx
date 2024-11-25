import './index.scss';

import type {
  CascaderProps,
  CheckboxGroupProps,
  DatePickerProps,
  FormInstance,
  InputNumberProps,
  InputProps,
  RadioGroupProps,
  SelectProps,
  SwitchProps,
  TextAreaProps,
  TreeSelectProps,
  UploadProps,
} from '@arco-design/web-react';
import {
  Button,
  Cascader,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  TreeSelect,
  Upload,
} from '@arco-design/web-react';
import type { BaseRangePickerProps } from '@arco-design/web-react/es/DatePicker/interface';
// TODO: Arco TextArea 没有直接在Input组件中export 只能单个import
import TextArea from '@arco-design/web-react/es/Input/textarea';
import { omit } from 'lodash-es';

import { file as fileUploadApi } from '@/api';
import { ResultEnum } from '@/enums';

import { FormButtonContainer, FormColContainer, FormItemContainer, FormRowContainer } from './components';
import type { FormConfig } from './interface';

export function useForm<T = unknown>(formConfig: FormConfig): [() => JSX.Element, FormInstance<T>] {
  // export function useForm(formConfig: FormConfig): [() => JSX.Element, FormInstance] {

  const FormItem = Form.Item;
  const RadioGroup = Radio.Group;
  const CheckboxGroup = Checkbox.Group;

  const [formInstance] = Form.useForm<T>();

  const formProps = omit<FormConfig>(formConfig, ['formItems', 'formButtons', 'layoutConfig']);

  const baseColNum = formConfig.layoutConfig?.baseCol ? formConfig.layoutConfig?.baseCol : 3;

  const gutter = formConfig.layoutConfig?.gutter ? formConfig.layoutConfig?.gutter : 0;

  const baseColWidth = 24 / baseColNum;

  const { RangePicker } = DatePicker;

  const CombineForm = () => {
    const isInLine = formConfig.layout === 'inline';
    const { formItems = [], formButtons = [] } = formConfig;
    let offsetMultiple = 0;

    if (formItems?.length && formButtons?.length) {
      offsetMultiple = formItems.length % baseColNum;
    }

    // const { field, depend, condition } = watch!;
    // const d = Form.useWatch(depend, formInstance as unknown as FormInstance);

    return (
      <Form form={formInstance as unknown as FormInstance} {...formProps} className='use-form-container'>
        <FormRowContainer isInLine={isInLine} gutter={gutter}>
          {formItems.map((item) => {
            const { formItemProps, componentProps, component, watch, hidden, customRender, span } = item;
            // const { field } = watch;

            // if (field === formItemProps.field && d && !condition(d)) {
            //   return null;
            // }

            return (
              // TODO: FormItem必须直接包裹在表单控件外，并且表单控件是 FormItem 的唯一子节点
              hidden?.() ? null : (
                <FormColContainer
                  isInLine={isInLine}
                  baseColWidth={span ? span : baseColWidth} // 行内设置的 span 优先级最高
                  key={formItemProps.field as string}
                >
                  <FormItemContainer
                    needUpdate={watch?.field ? watch?.field === formItemProps.field : false}
                    watch={watch}
                  >
                    <>
                      {component === 'input' && (
                        <FormItem {...formItemProps}>
                          <Input {...(componentProps as InputProps)} />
                        </FormItem>
                      )}
                      {component === 'password' && (
                        <FormItem {...formItemProps}>
                          <Input.Password {...(componentProps as InputProps)} />
                        </FormItem>
                      )}
                      {/* {component === 'group' && (
                      <FormItem {...formItemProps}>
                        <Input.Group compact>
                          {childrenItems?.map((childItem) => {
                            return (
                              <FormItem {...childItem.formItemProps}>
                                <Input {...(childItem.componentProps as InputProps)} />
                              </FormItem>
                            );
                          })}
                        </Input.Group>
                      </FormItem>
                    )} */}
                      {component === 'inputNumber' && (
                        <FormItem {...formItemProps}>
                          <InputNumber {...(componentProps as InputNumberProps)} />
                        </FormItem>
                      )}
                      {component === 'textarea' && (
                        <FormItem {...formItemProps}>
                          <TextArea {...(componentProps as TextAreaProps)} />
                        </FormItem>
                      )}
                      {component === 'switch' && (
                        <FormItem {...formItemProps}>
                          <Switch
                            {...(componentProps as SwitchProps)}
                            checkedIcon={<div className='i-material-symbols:check'></div>}
                          />
                        </FormItem>
                      )}
                      {component === 'radio' && (
                        <FormItem {...formItemProps}>
                          <RadioGroup {...(componentProps as RadioGroupProps)} />
                        </FormItem>
                      )}
                      {component === 'checkbox' && (
                        <FormItem {...formItemProps}>
                          <CheckboxGroup {...(componentProps as CheckboxGroupProps<string>)} />
                        </FormItem>
                      )}
                      {component === 'datePicker' && (
                        <FormItem {...formItemProps}>
                          <DatePicker {...(componentProps as DatePickerProps)} />
                        </FormItem>
                      )}
                      {component === 'rangePicker' && (
                        <FormItem {...formItemProps}>
                          <RangePicker {...(componentProps as BaseRangePickerProps)} />
                        </FormItem>
                      )}
                      {component === 'uploadPhoto' && (
                        <FormItem {...formItemProps}>
                          <Upload
                            {...(componentProps as UploadProps)}
                            customRequest={async (option) => {
                              const { onProgress, onError, onSuccess, file } = option;

                              try {
                                const { code, result } = await fileUploadApi.fileUpload({ file }, (event) => {
                                  if (event.total) {
                                    let percent;
                                    if (event.total > 0) {
                                      percent = (event.loaded / event.total) * 100;
                                    }

                                    onProgress(parseInt(String(percent), 10));
                                  }
                                });

                                if (code === ResultEnum.SUCCESS) {
                                  onSuccess(result);
                                } else {
                                  onError();
                                }
                              } catch (e) {
                                onError(e as object);
                              }
                            }}
                          ></Upload>
                        </FormItem>
                      )}
                      {component === 'select' && (
                        <FormItem {...formItemProps}>
                          <Select {...(componentProps as SelectProps)}></Select>
                        </FormItem>
                      )}
                      {component === 'cascader' && (
                        <FormItem {...formItemProps}>
                          <Cascader {...(componentProps as CascaderProps)}></Cascader>
                        </FormItem>
                      )}
                      {component === 'treeSelect' && (
                        <FormItem {...formItemProps}>
                          <TreeSelect {...(componentProps as TreeSelectProps)}></TreeSelect>
                        </FormItem>
                      )}
                      {/* 可自定义传入组件 */}
                      {component === 'custom' && (
                        <FormItem {...formItemProps}>{customRender ? customRender() : ''}</FormItem>
                      )}
                    </>
                  </FormItemContainer>
                </FormColContainer>
              )
            );
          })}
          {formButtons.length ? (
            <FormButtonContainer
              isInLine={isInLine}
              baseColWidth={baseColWidth}
              offsetWidth={(baseColNum - offsetMultiple - 1) * baseColWidth}
              key='button-container'
            >
              {formButtons.map((button) => {
                return (
                  <Button key={button.name} {...button} className={classNames('ml-4', button.className)}>
                    {button.name}
                  </Button>
                );
              })}
            </FormButtonContainer>
          ) : null}
        </FormRowContainer>
      </Form>
    );
  };

  return [CombineForm, formInstance];
}
