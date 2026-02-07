import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// Basic smoke test
describe('App', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<Text>Hello Yog</Text>);
    expect(getByText('Hello Yog')).toBeTruthy();
  });
});
