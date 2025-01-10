-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_borrowedBookId_fkey" FOREIGN KEY ("borrowedBookId") REFERENCES "BorrowedBook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
