import { expect } from 'chai';

import * as Pipeline from '@ring-toolkit/pipeline';

import * as MainEntryPoint from '../src/index';

describe('ring-toolkit main entrypoint', () => {
  it('exposes ringToolkit function', () => {
    expect('ringToolkit' in MainEntryPoint).to.be.true;
  });

  it('exposes registerCommand function', () => {
    expect('registerCommand' in MainEntryPoint).to.be.true;
  });

  it('re-export @ring-toolkit/pipeline', () => {
    expect(Object.keys(MainEntryPoint)).to.contain.members(Object.keys(Pipeline));
  });

  it("doesn't export anything else", () => {
    const knownKeys = [...Object.keys(Pipeline), 'ringToolkit', 'registerCommand'];

    const remaining = Object.keys(MainEntryPoint).filter(key => !knownKeys.includes(key));

    expect(remaining.length).to.equal(0);
  });
});
