export default [
  {
    value:
      '{{person.prefix}} {{person.first_name}} {{person.last_name}} {{person.last_name}}',
    weight: 1,
  },
  {
    value: '{{person.first_name}} {{person.last_name}} {{person.last_name}}',
    weight: 9,
  },
];
