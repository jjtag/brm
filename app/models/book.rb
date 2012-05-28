# encoding: utf-8

class Book < ActiveRecord::Base
end

# 现金单据
class CashBook < Book
end

# 银行单据
class BankBook < Book
end

# 票据单据
class BillBook < Book
end

# 贷款单据
class LoanBook < Book
end