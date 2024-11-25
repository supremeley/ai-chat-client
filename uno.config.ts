import presetAttributify from '@unocss/preset-attributify';
import presetIcons from '@unocss/preset-icons';
import { defineConfig, presetUno } from 'unocss';

export default defineConfig({
  rules: [['white-break', { 'white-space': 'break-spaces' }]],
  theme: {
    // TODO: examples
    // colors: {
    //   veryCool: '#0000ff', // class="text-very-cool"
    //   disabled: 'var(--color-text-4)',
    //   brand: {
    //     primary: 'hsl(var(--hue, 217) 78% 51%)', //class="bg-brand-primary"
    //   },
    // },
  },
  presets: [
    presetUno(),
    presetIcons({
      prefix: 'i-',
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
        'font-size': '18px',
      },
    }),
    presetAttributify({
      prefix: 'un-',
      prefixedOnly: true,
    }),
  ],
  shortcuts: {
    'flex-center': 'flex flex-justify-center flex-items-center',
    'flex-top-center': 'flex flex-justify-center',
    // 'white-space': 'break-spaces',
  },
  safelist: [
    'i-solar:document-add-outline',
    'i-icon-park-outline:system',
    'i-mi:user',
    'i-eos-icons:role-binding',
    'i-material-symbols-light',
    'i-fluent-mdl2:dictionary',
    'i-material-symbols:data-table',
    'i-pajamas:log',
  ],
});
