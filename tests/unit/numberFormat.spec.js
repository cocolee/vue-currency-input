import NumberFormat from '../../src/numberFormat'

describe('NumberFormat', () => {
  describe('constructing number formats', () => {
    it('should work for respective locale and currency', () => {
      expect(new NumberFormat({ locale: 'de-DE', currency: 'EUR' })).toMatchSnapshot('de-DE_EUR')
      expect(new NumberFormat({ locale: 'de-CH', currency: 'EUR' })).toMatchSnapshot('de-CH_EUR')
      expect(new NumberFormat({ locale: 'es-ES', currency: 'EUR' })).toMatchSnapshot('es-ES_EUR')
      expect(new NumberFormat({ locale: 'nl-NL', currency: 'EUR' })).toMatchSnapshot('nl-NL_EUR')
      expect(new NumberFormat({ locale: 'en-US', currency: 'USD' })).toMatchSnapshot('en-US_USD')
      expect(new NumberFormat({ locale: 'fr-CH', currency: 'CHF' })).toMatchSnapshot('fr-CH_CHF')
      expect(new NumberFormat({ locale: 'zh', currency: 'CNY' })).toMatchSnapshot('zh_CNY')
      expect(new NumberFormat({ locale: 'en-GB', currency: 'GBP' })).toMatchSnapshot('en-GB_GBP')
      expect(new NumberFormat({ locale: 'en-GB', currency: 'INR' })).toMatchSnapshot('en-IN_INR')
      expect(new NumberFormat({ locale: 'pt', currency: 'BRL' })).toMatchSnapshot('pt_BRL')
      expect(new NumberFormat({ locale: 'ja', currency: 'JPY' })).toMatchSnapshot('ja_JPY')
      expect(new NumberFormat({ locale: 'ar-SA', currency: 'SAR' })).toMatchSnapshot('ar-SA_SAR')
      expect(new NumberFormat({ locale: 'fa-IR', currency: 'IRR' })).toMatchSnapshot('fa-IR_IRR')
    })

    describe('custom currency symbol', () => {
      it('should work with a custom prefix', () => {
        expect(new NumberFormat({ locale: 'de-DE', currency: { prefix: '₿ ' } })).toMatchSnapshot()
      })

      it('should work wit a custom suffix', () => {
        expect(new NumberFormat({ locale: 'de-DE', currency: { suffix: ' Euro' } })).toMatchSnapshot()
      })

      it('should work if the currency symbol is hidden', () => {
        expect(new NumberFormat({ locale: 'de-DE' })).toMatchSnapshot()
      })
    })

    describe('custom precision', () => {
      it('should work with a custom precision', () => {
        expect(new NumberFormat({ precision: 0 })).toEqual(expect.objectContaining({ minimumFractionDigits: 0, maximumFractionDigits: 0 }))
        expect(new NumberFormat({ precision: { min: 0, max: 0 } })).toEqual(expect.objectContaining({ minimumFractionDigits: 0, maximumFractionDigits: 0 }))
        expect(new NumberFormat({ precision: { min: 0, max: 2 } })).toEqual(expect.objectContaining({ minimumFractionDigits: 0, maximumFractionDigits: 2 }))
      })

      it('should ignore precision ranges when "Auto decimal mode" is used', () => {
        expect(new NumberFormat({ currency: 'EUR', autoDecimalMode: true, precision: { min: 0, max: 2 } })).toEqual(expect.objectContaining({ minimumFractionDigits: 2, maximumFractionDigits: 2 }))
      })

      it('should ignore precision ranges when "Value as integer" is used', () => {
        expect(new NumberFormat({ currency: 'EUR', valueAsInteger: true, precision: { min: 0, max: 2 } })).toEqual(expect.objectContaining({ minimumFractionDigits: 2, maximumFractionDigits: 2 }))
      })

      it('should ignore the custom precision if the locale does not support decimal digits', () => {
        expect(new NumberFormat({ locale: 'ja', currency: 'JPY', precision: 2 })).toEqual(expect.objectContaining({ minimumFractionDigits: 0, maximumFractionDigits: 0 }))
      })
    })
  })

  describe('parse', () => {
    it('should return null if the value is empty', () => {
      expect(new NumberFormat({ locale: 'en' }).parse(null)).toBeNull()
      expect(new NumberFormat({ locale: 'en' }).parse('')).toBeNull()
      expect(new NumberFormat({ locale: 'en' }).parse(' ')).toBeNull()
    })

    it('should return null if the value is invalid', () => {
      expect(new NumberFormat({ locale: 'en' }).parse('-')).toBeNull()
      expect(new NumberFormat({ locale: 'en' }).parse('123e-1')).toBeNull()
      expect(new NumberFormat({ locale: 'en' }).parse('0x11')).toBeNull()
      expect(new NumberFormat({ locale: 'en' }).parse('0b11')).toBeNull()
      expect(new NumberFormat({ locale: 'en' }).parse('0o11')).toBeNull()
      expect(new NumberFormat({ locale: 'en' }).parse('1.2e1')).toBeNull()
      expect(new NumberFormat({ locale: 'en' }).parse('1.23.4')).toBeNull()
    })

    it('should return the parsed number if the value conforms to the currency format', () => {
      expect(new NumberFormat({ locale: 'en' }).parse('1234')).toBe(1234)
      expect(new NumberFormat({ locale: 'en' }).parse('1,234,567')).toBe(1234567)
      expect(new NumberFormat({ locale: 'en' }).parse('-1,234,567')).toBe(-1234567)
      expect(new NumberFormat({ locale: 'de' }).parse('-1234567,89')).toBe(-1234567.89)
      expect(new NumberFormat({ locale: 'en', currency: 'USD' }).parse('$1,234,567')).toBe(1234567)
      expect(new NumberFormat({ locale: 'de', currency: 'EUR' }).parse('1234 €')).toBe(1234)
      expect(new NumberFormat({ locale: 'en' }).parse('-1234')).toBe(-1234)
      expect(new NumberFormat({ locale: 'en', currency: 'USD' }).parse('-$1234')).toBe(-1234)
      expect(new NumberFormat({ locale: 'de', currency: 'EUR' }).parse('-1234 €')).toBe(-1234)
      expect(new NumberFormat({ locale: 'ja', currency: 'JPY' }).parse('￥123,456')).toBe(123456)
      expect(new NumberFormat({ locale: 'en' }).parse('0.5')).toBe(0.5)
      expect(new NumberFormat({ locale: 'en' }).parse('1234.50')).toBe(1234.5)
      expect(new NumberFormat({ locale: 'en' }).parse('1234.00')).toBe(1234)
      expect(new NumberFormat({ locale: 'en', currency: 'USD' }).parse('$1,234.50')).toBe(1234.5)
      expect(new NumberFormat({ locale: 'de', currency: 'EUR' }).parse('1.234,50 €')).toBe(1234.5)
      expect(new NumberFormat({ locale: 'ar', currency: 'SAR' }).parse('١٢٣٤')).toBe(1234)
      expect(new NumberFormat({ locale: 'ar', currency: 'SAR' }).parse('١٬٢٣٤')).toBe(1234)
      expect(new NumberFormat({ locale: 'ar', currency: 'SAR' }).parse('٠٫٩')).toBe(0.9)
      expect(new NumberFormat({ locale: 'ar', currency: 'SAR' }).parse('؜-٠٫٥٠ ر.س.‏')).toBe(-0.5)
      expect(new NumberFormat({ locale: 'en-IN', currency: 'INR' }).parse('₹1,23,334.00')).toBe(123334)
      expect(new NumberFormat({ locale: 'de-AT', currency: 'EUR' }).parse('€ 66.668')).toBe(66668)
      expect(new NumberFormat({ locale: 'de-AT', currency: null }).parse('-66 668')).toBe(-66668)
    })

    it('should return null if the value does not conform to the currency format', () => {
      expect(new NumberFormat({ locale: 'en' }).parse('1234,5')).toBeNull()
      expect(new NumberFormat({ locale: 'de' }).parse('1,234,567.89')).toBeNull()
      expect(new NumberFormat({ locale: 'de', currency: 'EUR' }).parse('$1234')).toBeNull()
      expect(new NumberFormat({ locale: 'en', currency: 'USD' }).parse('1234 €')).toBeNull()
      expect(new NumberFormat({ locale: 'ja', currency: 'JPY' }).parse('1234.56')).toBeNull()
    })
  })

  describe('isFractionIncomplete', () => {
    it('should return true if the fraction is incomplete', () => {
      expect(new NumberFormat({ locale: 'en' }).isFractionIncomplete('1234.')).toBe(true)
      expect(new NumberFormat({ locale: 'en' }).isFractionIncomplete('1234')).toBe(false)
      expect(new NumberFormat({ locale: 'en' }).isFractionIncomplete('1234.3')).toBe(false)
      expect(new NumberFormat({ locale: 'en' }).isFractionIncomplete('1234.3.')).toBe(false)
      expect(new NumberFormat({ locale: 'de' }).isFractionIncomplete('1,3,')).toBe(false)
    })
  })

  describe('normalizeDecimalSymbol', () => {
    it('should replace the first decimal symbol with the one of the current locale', () => {
      expect(new NumberFormat({ locale: 'en' }).normalizeDecimalSymbol('1,23,4,567', 2)).toBe('1,23.4,567')
    })
  })

  describe('format', () => {
    it('should return the formatted value for the respective options', () => {
      expect(new NumberFormat({ locale: 'en', currency: 'EUR' }).format(1234.5789)).toBe('€1,234.58')
      expect(new NumberFormat({ locale: 'en', currency: 'EUR' }).format(1234.5789, { minimumFractionDigits: 4 })).toBe('€1,234.5789')
      expect(new NumberFormat({ locale: 'en' }).format(-1)).toBe('-1.00')
      expect(new NumberFormat({ locale: 'en' }).format(-0)).toBe('-0.00')
      expect(new NumberFormat({ locale: 'en' }).format(1234.5789, { minimumFractionDigits: 4 })).toBe('1,234.5789')
    })
  })
})
