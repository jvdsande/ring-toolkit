import { expect } from 'chai';

import { Args, Usage } from '../../src/configuration/definitions';

describe('the configuration definitions file', () => {
  describe('the Args definitions object', () => {
    it('should contain a "shared" entry describing shared flags', () => {
      expect(Args.shared).to.exist;

      expect(Args.shared.map(arg => arg.name)).to.have.members([
        'command',
        'config',
        'empty',
        'help',
        'debug',
      ]);
    });
  });

  describe('the Usage definitions object', () => {
    it('should contain a "main" entry containing general usage of the tool', () => {
      expect(Usage.main).to.exist;
      expect(Usage.main.length).to.equal(2);

      expect(Usage.main[0].header).to.equal('Ring Toolkit');
      expect(Usage.main[1].header).to.equal('Usage');
    });

    it('should contain an "options" entry containing options guidelines', () => {
      expect(Usage.options).to.exist;
      expect(Usage.options([])).to.exist;
    });

    it('should allow configuring the content of the first "options" entry', () => {
      expect(Usage.options(['test1'])[0].content).to.equal('$ ring-toolkit test1 --help');
      expect(Usage.options(['test2'])[0].content).to.equal('$ ring-toolkit test2 --help');
    });

    it('should pass the "shared" arguments as optionList for the second "options" entry', () => {
      expect(Usage.options([])[1].optionList).to.equal(Args.shared);
    });

    it('should hide the main "command" option from optionList', () => {
      expect(Usage.options([])[1].hide).to.have.members(['command']);
    });
  });
});
