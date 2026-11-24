CREATE TYPE "Role" AS ENUM ('CLIENT','PRO','ADMIN');
CREATE TYPE "Plan" AS ENUM ('FREE','PRO','PREMIUM');
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING','ACCEPTED','DECLINED','DONE');

CREATE TABLE "User" ("id" TEXT PRIMARY KEY,"name" TEXT NOT NULL,"email" TEXT NOT NULL,"passwordHash" TEXT NOT NULL,"role" "Role" NOT NULL DEFAULT 'CLIENT',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "City" ("id" TEXT PRIMARY KEY,"name" TEXT NOT NULL,"state" TEXT NOT NULL,"slug" TEXT NOT NULL);
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");
CREATE TABLE "Category" ("id" TEXT PRIMARY KEY,"name" TEXT NOT NULL,"slug" TEXT NOT NULL);
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE TABLE "Professional" ("id" TEXT PRIMARY KEY,"userId" TEXT NOT NULL,"categoryId" TEXT NOT NULL,"cityId" TEXT NOT NULL,"neighborhood" TEXT NOT NULL DEFAULT '',"bio" TEXT NOT NULL DEFAULT '',"whatsapp" TEXT NOT NULL,"photoUrl" TEXT,"portfolio" TEXT[],"approved" BOOLEAN NOT NULL DEFAULT false,"plan" "Plan" NOT NULL DEFAULT 'FREE',"views" INTEGER NOT NULL DEFAULT 0,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "Professional_userId_key" ON "Professional"("userId");
CREATE INDEX "Professional_cityId_categoryId_approved_idx" ON "Professional"("cityId","categoryId","approved");
CREATE TABLE "Quote" ("id" TEXT PRIMARY KEY,"clientId" TEXT NOT NULL,"proId" TEXT NOT NULL,"message" TEXT NOT NULL,"scheduledAt" TIMESTAMP(3),"status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Favorite" ("userId" TEXT NOT NULL,"proId" TEXT NOT NULL,PRIMARY KEY ("userId","proId"));
CREATE TABLE "Review" ("id" TEXT PRIMARY KEY,"userId" TEXT NOT NULL,"proId" TEXT NOT NULL,"rating" INTEGER NOT NULL,"comment" TEXT NOT NULL,"hidden" BOOLEAN NOT NULL DEFAULT false,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "Review_userId_proId_key" ON "Review"("userId","proId");
CREATE TABLE "Report" ("id" TEXT PRIMARY KEY,"userId" TEXT NOT NULL,"proId" TEXT NOT NULL,"reason" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "Subscription" ("id" TEXT PRIMARY KEY,"proId" TEXT NOT NULL,"plan" "Plan" NOT NULL,"mpId" TEXT NOT NULL,"status" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "Subscription_mpId_key" ON "Subscription"("mpId");
CREATE TABLE "AuditLog" ("id" TEXT PRIMARY KEY,"actorId" TEXT NOT NULL,"action" TEXT NOT NULL,"detail" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);

ALTER TABLE "Professional" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Professional" ADD FOREIGN KEY ("categoryId") REFERENCES "Category"("id");
ALTER TABLE "Professional" ADD FOREIGN KEY ("cityId") REFERENCES "City"("id");
ALTER TABLE "Quote" ADD FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Quote" ADD FOREIGN KEY ("proId") REFERENCES "Professional"("id") ON DELETE CASCADE;
ALTER TABLE "Favorite" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Favorite" ADD FOREIGN KEY ("proId") REFERENCES "Professional"("id") ON DELETE CASCADE;
ALTER TABLE "Review" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Review" ADD FOREIGN KEY ("proId") REFERENCES "Professional"("id") ON DELETE CASCADE;
ALTER TABLE "Report" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Report" ADD FOREIGN KEY ("proId") REFERENCES "Professional"("id") ON DELETE CASCADE;
ALTER TABLE "Subscription" ADD FOREIGN KEY ("proId") REFERENCES "Professional"("id") ON DELETE CASCADE;

INSERT INTO "City" ("id","name","state","slug") VALUES ('city_cataguases','Cataguases','MG','cataguases-mg');
INSERT INTO "Category" ("id","name","slug") VALUES
('cat_01','Eletricistas','eletricistas'),('cat_02','Pedreiros','pedreiros'),('cat_03','Pintores','pintores'),
('cat_04','Encanadores','encanadores'),('cat_05','Diaristas','diaristas'),('cat_06','Técnicos de informática','tecnicos-informatica'),
('cat_07','Mecânicos','mecanicos'),('cat_08','Jardineiros','jardineiros'),('cat_09','Instaladores de ar-condicionado','ar-condicionado'),
('cat_10','Cabeleireiros','cabeleireiros'),('cat_11','Montadores de móveis','montadores-moveis'),('cat_12','Assistência técnica','assistencia-tecnica');
