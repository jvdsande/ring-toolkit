import { expect } from 'chai';
import { getAliasConfiguration } from '../../src/configuration/getAliasConfiguration';
import { stub } from 'sinon';

describe('the getAliasConfiguration function', () => {
  it('should extract an object configuration based on its key', async () => {
    const configuration = {
      hello: {
        world: true,
      },
      goodbye: false,
    };

    expect(await getAliasConfiguration(configuration, 'hello', {})).to.deep.equal({ world: true });
    expect(await getAliasConfiguration(configuration, 'goodbye', {})).to.equal(false);
  });

  it('should execute a function configuration based on its key', async () => {
    const configuration = {
      hello: stub().returns({ world: true }),
      goodbye: stub().returns(false),
    };

    expect(await getAliasConfiguration(configuration, 'hello', {})).to.deep.equal({ world: true });
    expect(await getAliasConfiguration(configuration, 'goodbye', {})).to.equal(false);
    expect(configuration.hello.calledOnce).to.be.true;
    expect(configuration.goodbye.calledOnce).to.be.true;
  });

  it('should await a promise configuration based on its key', async () => {
    const configuration = {
      hello: stub().resolves({ world: true }),
      goodbye: stub().resolves(false),
    };

    expect(await getAliasConfiguration(configuration, 'hello', {})).to.deep.equal({ world: true });
    expect(await getAliasConfiguration(configuration, 'goodbye', {})).to.equal(false);
    expect(configuration.hello.calledOnce).to.be.true;
    expect(configuration.goodbye.calledOnce).to.be.true;
  });

  it('should pass command options to a function configuration', async () => {
    const configuration = {
      hello: stub(),
    };
    const options = {
      hello: 'world',
    };

    await getAliasConfiguration(configuration, 'hello', options);

    expect(configuration.hello.calledOnce).to.be.true;
    expect(configuration.hello.lastCall.firstArg).to.deep.equal(options);
  });

  it('should return undefined if key is unknown', async () => {
    const configuration = {
      hello: {
        world: true,
      },
      goodbye: false,
    };

    expect(await getAliasConfiguration(configuration, 'unknown', {})).to.be.undefined;
  });
});
